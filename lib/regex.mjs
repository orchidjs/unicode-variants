
/**
 * Convert array of strings to a regular expression
 *	ex ['ab','a'] => (?:ab|a)
 * 	ex ['a','b'] => [ab]
 * @param {string[]} chars
 * @return {string}
 */
export const arrayToPattern = (chars) =>{

	chars = chars.filter( Boolean );

	if( chars.length < 2 ){
		return chars[0] || '';
	}

	return (maxValueLength(chars) == 1) ? '['+chars.join('')+']' : '(?:'+chars.join('|')+')';
};

/**
 * @param {string[]} array
 * @return {string}
 */
export const sequencePattern = (array)=>{

	if( !hasDuplicates(array) ){
		return array.join('');
	}

	let pattern = '';
	let prev_char_count = 0;

	const prev_pattern = ()=>{
		if( prev_char_count > 1 ){
			pattern += '{'+prev_char_count+'}';
		}
	}

	array.forEach((char,i)=>{

		if( char === array[i-1] ){
			prev_char_count++;
			return;
		}

		prev_pattern();

		pattern += char;
		prev_char_count = 1;
	});

	prev_pattern();

	return pattern;

}



/**
 * Convert array of strings to a regular expression
 *	ex ['ab','a'] => (?:ab|a)
 * 	ex ['a','b'] => [ab]
 * @param {Set<string>} chars
 * @return {string}
 */
export const setToPattern = (chars)=>{
	let array = toArray(chars);
	return arrayToPattern(array);
}



/**
 *
 * https://stackoverflow.com/questions/7376598/in-javascript-how-do-i-check-if-an-array-has-duplicate-values
 * @param {any[]} array
 */
export const hasDuplicates = (array) => {
    return (new Set(array)).size !== array.length;
}


/**
 * https://stackoverflow.com/questions/63006601/why-does-u-throw-an-invalid-escape-error
 * @param {string} str
 * @return {string}
 */
export const escape_regex = (str) => {
	return (str + '').replace(/([\$\(\)\*\+\.\?\[\]\^\{\|\}\\])/gu, '\\$1');
};

/**
 * Return the max length of array values
 * @param {string[]} array
 *
 */
export const maxValueLength = (array) => {
	return array.reduce( (longest, value) => Math.max(longest,unicodeLength(value)),0);
}


/**
 * @param {string} str
 */
export const unicodeLength = (str) => {
	return toArray(str).length;
}

/**
 * @param {any} p
 * @return {any[]}
 */
export const toArray = (p) => Array.from(p);
