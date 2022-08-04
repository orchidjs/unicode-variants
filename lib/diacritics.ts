

type TDiacraticList = {[key:string]:string};

var folded_pat:RegExp;
const accent_pat = '[\u0300-\u036F\u{b7}\u{2be}]'; // \u{2bc}
const accent_reg = new RegExp(accent_pat,'gu');
var diacritic_patterns:TDiacraticList;

const latin_convert:TDiacraticList = {
	'æ': 'ae',
	'ⱥ': 'a',
	'ø': 'o',
};

const convert_pat = new RegExp(Object.keys(latin_convert).join('|'),'gu');

const code_points:[[number,number]] = [[ 0, 65535 ]];

/**
 * Remove accents
 * via https://github.com/krisk/Fuse/issues/133#issuecomment-318692703
 *
 */
export const asciifold = (str:string):string => {
	return str
		.normalize('NFKD')
		.replace(accent_reg, '')
		.toLowerCase()
		.replace(convert_pat,function(foreignletter) {
			return latin_convert[foreignletter] || foreignletter;
		});
};

/**
 *
 * https://stackoverflow.com/questions/63006601/why-does-u-throw-an-invalid-escape-error
 */
export const escape_regex = (str:string):string => {
	return (str + '').replace(/([\$\(\)\*\+\.\?\[\]\^\{\|\}\\])/gu, '\\$1');
};


/**
 * Convert array of strings to a regular expression
 *	ex ['ab','a'] => (?:ab|a)
 * 	ex ['a','b'] => [ab]
 *
 */
export const arrayToPattern = (chars:string[],glue:string='|'):string =>{

	if( chars.length === 1 && chars[0] != undefined ){
		return chars[0];
	}

	var longest = 1;
	chars.forEach((a)=>{longest = Math.max(longest,a.length)});

	if( longest == 1 ){
		return '['+chars.join('')+']';
	}

	return '(?:'+chars.join(glue)+')';
};

export const escapeToPattern = (chars:string[]):string =>{
	const escaped = chars.map((diacritic) => escape_regex(diacritic));
	return arrayToPattern(escaped);
};

/**
 * Get all possible combinations of substrings that add up to the given string
 * https://stackoverflow.com/questions/30169587/find-all-the-combination-of-substrings-that-add-up-to-the-given-string
 *
 */
export const allSubstrings = (input:string):string[][] => {

    if( input.length === 1) return [[input]];

    var result:string[][] = [];
    allSubstrings(input.substring(1)).forEach(function(subresult) {
        var tmp = subresult.slice(0);
        tmp[0] = input.charAt(0) + tmp[0];
        result.push(tmp);

        tmp = subresult.slice(0);
        tmp.unshift(input.charAt(0));
        result.push(tmp);
    });

    return result;
}

/**
 * Generate a list of diacritics from the list of code points
 *
 */
export const generateDiacritics = (code_points:[[number,number]]):TDiacraticList => {

	var diacritics:{[key:string]:string[]} = {};
	code_points.forEach((code_range)=>{

		for(let i = code_range[0]; i <= code_range[1]; i++){

			let diacritic	= String.fromCharCode(i);
			let	folded		= asciifold(diacritic);

			if( folded == diacritic.toLowerCase() ){
				continue;
			}

			// skip when folded is a string longer than 3 characters long
			// bc the resulting regex patterns will be long
			// eg:
			// folded صلى الله عليه وسلم length 18 code point 65018
			// folded جل جلاله length 8 code point 65019
			if( folded.length > 3 ){
				continue;
			}

			const folded_diacritics:string[] = diacritics[folded] || [folded];
			const patt = new RegExp( escapeToPattern(folded_diacritics),'iu');
			if( diacritic.match(patt) ){
				continue;
			}
			folded_diacritics.push(diacritic);
			diacritics[folded] = folded_diacritics;
		}
	});

	// filter out if there's only one character in the list
	// todo: this may not be needed
	Object.keys(diacritics).forEach(folded => {
		const folded_diacritics = diacritics[folded] || [];
		if( folded_diacritics.length < 2 ){
			delete diacritics[folded];
		}
	});


	// folded character pattern
	// match longer substrings first
	let folded_chars	= Object.keys(diacritics).sort((a, b) => b.length - a.length );
	folded_pat		= new RegExp('('+ escapeToPattern(folded_chars) + accent_pat + '*)','gu');


	// build diacritic patterns
	// ae needs:
	//	(?:(?:ae|Æ|Ǽ|Ǣ)|(?:A|Ⓐ|Ａ...)(?:E|ɛ|Ⓔ...))
	var diacritic_patterns:TDiacraticList = {};
	folded_chars.sort((a,b) => a.length -b.length).forEach((folded)=>{

		var substrings	= allSubstrings(folded);
		var pattern = substrings.map((sub_pat)=>{

			sub_pat = sub_pat.map((l)=>{
				if( diacritics.hasOwnProperty(l) ){
					return escapeToPattern(diacritics[l]!);
				}
				return l;
			});

			return arrayToPattern(sub_pat,'');
		});

		diacritic_patterns[folded] = arrayToPattern(pattern);
	});


	return diacritic_patterns;
}

/**
 * Initialize the list of diacritics from the give code point ranges
 *
 */
export const initialize = (_code_points?:[[number,number]]) => {
	if( diacritic_patterns !== undefined ) return;
	diacritic_patterns = generateDiacritics(_code_points || code_points );
}

/**
 * Expand a regular expression pattern to include diacritics
 * 	eg /a/ becomes /aⓐａẚàáâầấẫẩãāăằắẵẳȧǡäǟảåǻǎȁȃạậặḁąⱥɐɑAⒶＡÀÁÂẦẤẪẨÃĀĂẰẮẴẲȦǠÄǞẢÅǺǍȀȂẠẬẶḀĄȺⱯ/
 *
 */
export const diacriticRegexPoints = (regex:string):string => {

	initialize(code_points);

	const decomposed		= regex.normalize('NFKD').toLowerCase();

	return decomposed.split(folded_pat).map((part:string)=>{

		// "ﬄ" or "ffl"
		const no_accent = asciifold(part);
		if( no_accent == '' ){
			return '';
		}

		if( diacritic_patterns.hasOwnProperty(no_accent) ){
			return diacritic_patterns[no_accent];
		}

		return part;
	}).join('');

}


export const regExp = (needle:string):RegExp => {
	needle = diacriticRegexPoints(needle);
	return new RegExp(needle,'iu')
}
