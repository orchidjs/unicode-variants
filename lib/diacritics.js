
import {code_points} from './code_points.js';


/** @type {RegExp} */
let folded_pat;
const accent_pat = '[\u0300-\u036F\u{b7}\u{2be}]'; // \u{2bc}
const accent_reg = new RegExp(accent_pat,'gu');

/** @type {TDiacraticList} */
export let diacritic_patterns;

/** @type {TDiacraticList} */
const latin_convert = {
	'æ': 'ae',
	'ⱥ': 'a',
	'ø': 'o',
};

const convert_pat = new RegExp(Object.keys(latin_convert).join('|'),'gu');


/**
 * Return a diacritic insensitive regular expression for the given needle
 * @param {string} needle
 * @return {RegExp}
 */
export const regExp = (needle) => {
	needle = diacriticRegexPoints(needle);
	return new RegExp(needle,'iu')
}


/**
 * Initialize the list of diacritics from the give code point ranges
 *
 * @param {TCodePoints=} _code_points
 */
export const initialize = (_code_points) => {
	if( diacritic_patterns !== undefined ) return;
	diacritic_patterns = generateDiacritics(_code_points || code_points );
}



/**
 * Compatibility Decomposition without reordering string
 * calling str.normalize('NFKD') on \u{594}\u{595}\u{596} becomes \u{596}\u{594}\u{595}
 * @param {string} str
 */
export const decompose = (str) =>{
	return eachChar(str,(char)=>{
		return char.normalize('NFKD');
	}).join('');
}


/**
 * Remove accents
 * via https://github.com/krisk/Fuse/issues/133#issuecomment-318692703
 * @param {string} str
 * @return {string}
 */
export const asciifold = (str) => {
	return decompose(str)
		.replace(accent_reg, '')
		.toLowerCase()
		.replace(convert_pat,function(foreignletter) {
			return latin_convert[foreignletter] || foreignletter;
		});
};

/**
 * https://stackoverflow.com/questions/63006601/why-does-u-throw-an-invalid-escape-error
 * @param {string} str
 * @return {string}
 */
export const escape_regex = (str) => {
	return (str + '').replace(/([\$\(\)\*\+\.\?\[\]\^\{\|\}\\])/gu, '\\$1');
};


/**
 * Convert array of strings to a regular expression
 *	ex ['ab','a'] => (?:ab|a)
 * 	ex ['a','b'] => [ab]
 * @param {string[]} chars
 * @param {string} glue
 * @return {string}
 */
export const arrayToPattern = (chars,glue='|') =>{

	if( chars.length === 1 && chars[0] != undefined ){
		return chars[0];
	}

	let longest = 1;
	chars.forEach((a)=>{longest = Math.max(longest,a.length)});

	if( longest == 1 && glue == '|' ){
		return '['+chars.join('')+']';
	}

	return '(?:'+chars.join(glue)+')';
};


/**
 * @param {string[]} chars
 * @return {string}
 */
export const escapeToPattern = (chars) =>{
	const escaped = chars.map((diacritic) => escape_regex(diacritic));
	return arrayToPattern(escaped);
};


/**
 * Convert array of strings to a regular expression
 *	ex ['ab','a'] => (?:ab|a)
 * 	ex ['a','b'] => [ab]
 * @param {Set<string>} chars
 * @param {string} glue
 * @return {string}
 */
export const setToPattern = (chars,glue='|')=>{
	let array = Array.from(chars);
	return arrayToPattern(array,glue);
}


/**
 * Get all possible combinations of substrings that add up to the given string
 * https://stackoverflow.com/questions/30169587/find-all-the-combination-of-substrings-that-add-up-to-the-given-string
 * @param {string} input
 * @return {string[][]}
 */
export const allSubstrings = (input) => {

    if( input.length === 1) return [[input]];

	/** @type {string[][]} */
    let result = [];
    allSubstrings(input.substring(1)).forEach(function(subresult) {
        let tmp = subresult.slice(0);
        tmp[0] = input.charAt(0) + tmp[0];
        result.push(tmp);

        tmp = subresult.slice(0);
        tmp.unshift(input.charAt(0));
        result.push(tmp);
    });

    return result;
}

/**
 * Loop through each character in a string
 * @param {string} str
 * @param { (char:string) => string} callback
 * @return {string[]}
 */
export const eachChar = (str,callback) =>{
	return Array.from(str).map(callback)
}



/**
 * Generate a list of diacritics from the list of code points
 * @param {TCodePoints} code_points
 * @return {TDiacraticList}
 */
export const generateDiacritics = (code_points) => {

	/** @type {{[key:string]:Set<string>}} */
	let diacritics = {};



	/**
	 * @param {string} folded
	 * @param {string} to_add
	 */
	const addMatching = (folded,to_add) => {

		/** @type {Set<string>} */
		const folded_diacritics = diacritics[folded] || new Set();

		let is_empty = to_add.trim();
		if( is_empty.length == 0 ) return;



		const patt = new RegExp( '^'+setToPattern(folded_diacritics)+'$','iu');
		if( to_add.match(patt) ){
			return;
		}

		to_add = escape_regex(to_add);

		// use \\p{M}
		// size: 513,577 vs 518,277
		/*
		const p = new RegExp('^'+escape_regex(folded)+'\\p{M}$','iu');
		if( p.test(to_add) ){
			to_add = escape_regex(folded)+'\\p{M}';
		}
		*/

		folded_diacritics.add(to_add);
		diacritics[folded] = folded_diacritics;
	}


	code_points.forEach((code_range)=>{

		for(let i = code_range[0]; i <= code_range[1]; i++){

			let diacritic		= String.fromCharCode(i);
			let folded			= asciifold(diacritic);


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


			let decomposed		= diacritic.normalize('NFKD');


			if( folded.length == 0 ){
				continue
			}

			//if( folded === decomposed ){
			//	continue;
			//}


			addMatching(folded,decomposed);
			addMatching(folded,folded);
			addMatching(folded,diacritic);
		}
	});

	// filter out if there's only one character in the list
	// todo: this may not be needed
	Object.keys(diacritics).forEach(folded => {
		/** @type {Set<string>} */
		const folded_diacritics = diacritics[folded] || new Set();
		if( folded_diacritics.size < 2 ){
			delete diacritics[folded];
		}
	});


	// folded character pattern
	// match longer substrings first
	let folded_chars	= Object.keys(diacritics).sort((a, b) => b.length - a.length );
	folded_pat			= new RegExp('('+ escapeToPattern(folded_chars) + accent_pat + '*)+','gu');


	// build diacritic patterns
	// ae needs:
	//	(?:(?:ae|Æ|Ǽ|Ǣ)|(?:A|Ⓐ|Ａ...)(?:E|ɛ|Ⓔ...))

	/** @type {TDiacraticList} */
	let diacritic_patterns = {};

	let max_len = 0;
	let max_pat = '';
	let max_folded = '';
	let max_array = [];
	folded_chars.sort((a,b) => a.length -b.length).forEach((folded)=>{

		/** @type {Set<string>} */
		let diacritics_folded = diacritics[folded] || new Set();

		let pat_array;
		let pattern;

		if( false && folded.length > 1 ){
			pat_array = eachChar(folded,(char)=>{
				let pat = diacritics[char];
				if( pat != undefined ){
					return setToPattern(pat);
				}
				return char;
			});

			let pat = arrayToPattern(pat_array,'');

			// 1387ms
			pat_array = [
				setToPattern(diacritics_folded),
				pat
			];

			// ?? remove the folded value from `diacritics[folded]`
			// doesn't appear to be significantly faster or save on size
			/*
			pat_array = [pat];
			let dpat = diacritics_folded;
			if( dpat != undefined ){
				if( dpat.has(folded) ){
					dpat.delete(folded);
				}
				pat_array.push(setToPattern(dpat));
			}
			*/


			pattern = arrayToPattern(pat_array);

		}else{
			pattern = setToPattern(diacritics_folded);
		}




		// max_len 574
		let len = pattern.length
		if( len > max_len ){
			max_len = len;
			max_pat = pattern;
			max_folded = folded;
			max_array = pat_array;
		}

		diacritic_patterns[folded] = pattern;

	});

	//console.log('max_len',max_len,'max_folded',max_folded,max_array);
	//console.log('size',JSON.stringify(diacritic_patterns,null,1));

	return diacritic_patterns;
}


/**
 * Expand a regular expression pattern to include diacritics
 * 	eg /a/ becomes /aⓐａẚàáâầấẫẩãāăằắẵẳȧǡäǟảåǻǎȁȃạậặḁąⱥɐɑAⒶＡÀÁÂẦẤẪẨÃĀĂẰẮẴẲȦǠÄǞẢÅǺǍȀȂẠẬẶḀĄȺⱯ/
 * @param {string} regex
 * @return {string}
 */
export const diacriticRegexPoints = (regex) => {

	initialize(code_points);
	regex = regex.toLowerCase()

	//const decomposed		= regex.normalize('NFKD').toLowerCase();
	//const folded			= asciifold(regex);


	const folded = asciifold(regex);

	/**
	 * @param {string} part
	 */
	return folded.split(folded_pat).map((part)=>{

		if( part == '' ){
			return '';
		}


		// "ﬄ" or "ffl"
		const no_accent = asciifold(part);
		if( no_accent == '' ){
			return '';
			return part+'?';
		}

		if( diacritic_patterns.hasOwnProperty(no_accent) ){

			let subs = allSubstrings(no_accent);
			let patts = new Set();
			for( let i = 0; i < subs.length; i++ ){
				let sub_pat = subs[i].map((char)=>{
					return diacritic_patterns[char] || char;
				});
				patts.add( arrayToPattern(sub_pat,''));
			}

			return setToPattern(patts);

			return diacritic_patterns[no_accent];
		}

		return escape_regex(part);
	}).join('');


}

/**
 * @param {string} str
 */
export const strCodePoints = (str) => {
	var code_points = Array.from(str)
		.map((v) =>{
			var hex = v.codePointAt(0).toString(16);
			return v + " = \\u{" + hex + "}";
		});

	return code_points;
}


export {code_points};
