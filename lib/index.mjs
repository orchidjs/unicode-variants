
import { code_points } from './code_points.mjs';
import { setToPattern, arrayToPattern, escape_regex, sequencePattern } from './regex.mjs';
import { allSubstrings, getSplits } from './strings.mjs';


const accent_pat = '[\u0300-\u036F\u{b7}\u{2be}]'; // \u{2bc}

/** @type {TUnicodeMap} */
export let unicode_map;

/** @type {TUnicodeMap} */
const latin_convert = {
	'æ': 'ae',
	'ⱥ': 'a',
	'ø': 'o',
	'⁄': '/',
	'∕': '/',
};

const convert_pat = new RegExp(Object.keys(latin_convert).join('|')+'|'+accent_pat,'gu');



/**
 * Initialize the unicode_map from the give code point ranges
 *
 * @param {TCodePoints=} _code_points
 */
export const initialize = (_code_points) => {
	if( unicode_map !== undefined ) return;
	unicode_map = generateMap(_code_points || code_points );
}



/**
 * Compatibility Decomposition without reordering string
 * calling str.normalize('NFKD') on \u{594}\u{595}\u{596} becomes \u{596}\u{594}\u{595}
 * @param {string} str
 */
export const decompose = (str) =>{

	let normalize = str.normalize('NFKD');
	if( str.match(/[\u0f71-\u0f81]/) ){
		let result = '';
		const len = str.length;
		for( var x = 0; x < len; x++ ){
	  		result += str.charAt(x).normalize('NFKD');
		}
		return result;
	}

	return str.normalize('NFKD');
}




/**
 * Remove accents
 * via https://github.com/krisk/Fuse/issues/133#issuecomment-318692703
 * @param {string} str
 * @return {string}
 */
export const asciifold = (str) => {
	return decompose(str)
		.toLowerCase()
		.replace(convert_pat,function(foreignletter) {
			return latin_convert[foreignletter] || '';
		});
};






/**
 * Generate a list of unicode variants from the list of code points
 * @param {TCodePoints} code_points
 * @yield {TCodePointObj}
 */
export function* generator(code_points){

	for(const code_range of code_points){
		for(let i = code_range[0]; i <= code_range[1]; i++){

			let composed		= String.fromCharCode(i);
			let folded			= asciifold(composed);


			if( folded == composed.toLowerCase() ){
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

			if( folded.length == 0 ){
				continue
			}

			let decomposed		= composed.normalize('NFKD');
			let recomposed		= decomposed.normalize('NFC');

			if( recomposed === composed && folded === decomposed ){
				continue;
			}


			yield {folded:folded,composed:composed,code_point:i};
		}
	}
}


/**
 * Generate a unicode map from the list of code points
 * @param {TCodePoints} code_points
 * @return {TUnicodeSets}
 */
export const generateSets = (code_points) => {

	/** @type {{[key:string]:Set<string>}} */
	const unicode_sets = {};


	/**
	 * @param {string} folded
	 * @param {string} to_add
	 */
	const addMatching = (folded,to_add) => {

		/** @type {Set<string>} */
		const folded_set = unicode_sets[folded] || new Set();

		const patt = new RegExp( '^'+setToPattern(folded_set)+'$','iu');
		if( to_add.match(patt) ){
			return;
		}

		folded_set.add(escape_regex(to_add));
		unicode_sets[folded] = folded_set;
	}


	for( let value of generator(code_points) ){
		addMatching(value.folded,value.folded);
		addMatching(value.folded,value.composed);
	}

	return unicode_sets;
}

/**
 * Generate a unicode map from the list of code points
 * ae => (?:(?:ae|Æ|Ǽ|Ǣ)|(?:A|Ⓐ|Ａ...)(?:E|ɛ|Ⓔ...))
 *
 * @param {TCodePoints} code_points
 * @return {TUnicodeMap}
 */
export const generateMap = (code_points) => {

	/** @type {TUnicodeSets} */
	const unicode_sets = generateSets(code_points);

	/** @type {TUnicodeMap} */
	const unicode_map = {};


	for( let folded in unicode_sets ){
		let set = unicode_sets[folded];
		if( set != undefined ){
			unicode_map[folded] = setToPattern(set);
		}
	}

	return unicode_map;
}


/**
 * Map each element of an array from it's folded value to all possible unicode matches
 * @param {string[]} strings
 * @param {number} min_replacement
 * @return {string|undefined}
 */
export const mapSequence = (strings,min_replacement=1) =>{
	let chars_replaced = 0;


	strings = strings.map((str)=>{
		if( !unicode_map.hasOwnProperty(str) ){
			return str;
		}

		chars_replaced += str.length;

		return unicode_map[str] || str;
	});

	if( chars_replaced >= min_replacement ){
		return sequencePattern(strings);
	}
}

/**
 * Convert a short string and split it into all possible patterns
 * Keep a pattern only if min_replacement is met
 *
 * 'abc'
 * 		=> [['abc'],['ab','c'],['a','bc'],['a','b','c']]
 *		=> ['abc-pattern','ab-c-pattern'...]
 *
 *
 * @param {string} str
 * @param {number} min_replacement
 *
 */
export const substringsToPattern = (str,min_replacement=1) => {
	let substrings	= allSubstrings(str);
	let patterns	= [];

	min_replacement = Math.max(min_replacement,str.length-1);
	for( let sub_pat of substrings ){

		let pattern = mapSequence(sub_pat,min_replacement);

		if( pattern ){
			patterns.push(pattern);
		}

	}

	//console.log('patterns',patterns);
	if( patterns.length > 0 ){
		return arrayToPattern(patterns);
	}


}

/**
 * Convert an array of parts to a regex pattern string
 * Keep a pattern only if min_replacement is met
 *
 * ['abc','def']
 *		=> (?:abc-pattern)(?:def-pattern)
 *
 *
 * @param {string[]} parts
 * @param {number} min_replacement
 *
 */
const partsToPattern = (parts,min_replacement=1) => {
	let pattern = []

	for( let part of parts ){
		let p = substringsToPattern(part,min_replacement);
		if( p ){
			pattern.push(p);
		}
	}

	if( pattern.length > 0 ){
		return sequencePattern(pattern);
	}

}

/**
 * Expand a regular expression pattern to include unicode variants
 * 	eg /a/ becomes /aⓐａẚàáâầấẫẩãāăằắẵẳȧǡäǟảåǻǎȁȃạậặḁąⱥɐɑAⒶＡÀÁÂẦẤẪẨÃĀĂẰẮẴẲȦǠÄǞẢÅǺǍȀȂẠẬẶḀĄȺⱯ/
 *
 * Issue:
 *  ﺊﺋ [ 'ﺊ = \\u{fe8a}', 'ﺋ = \\u{fe8b}' ]
 *	becomes:	ئئ [ 'ي = \\u{64a}', 'ٔ = \\u{654}', 'ي = \\u{64a}', 'ٔ = \\u{654}' ]
 *
 *	İĲ = IIJ = ⅡJ
 *
 * 	1/2/4
 *
 * @param {string} str
 * @return {string|undefined}
 */
export const getPattern = (str) => {
	initialize();

	str				= asciifold(str);
	let splits		= getSplits(str, 3);


	// convert each split into a pattern
	// discard duplicates
	let patterns = [];
	for( let parts of splits ){

		let pattern = partsToPattern(parts);

		if( pattern == '' || pattern == undefined || patterns.indexOf(pattern) >= 0 ){
			continue;
		}
		patterns.push(pattern);
	}


	return arrayToPattern(patterns) || mapSequence(Array.from(str),0);
}


export { code_points, escape_regex };
