
/**
 * Convert array of strings to a regular expression
 *	ex ['ab','a'] => (?:ab|a)
 * 	ex ['a','b'] => [ab]
 * @param {string[]} chars
 * @return {string}
 */
export const arrayToPattern = (chars) =>{

	if( chars.length == 0 ){
		return '';
	}

	if( chars.length === 1 && chars[0] != undefined ){
		return chars[0];
	}

	let longest = maxValueLength(chars);
	if( longest == 1 ){
		return '['+chars.join('')+']';
	}

	return '(?:'+chars.join('|')+')';
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

	/** @type {string} */
	let prev_char;
	let prev_char_count = 0;

	array.forEach((char,i)=>{

		if( char === prev_char ){
			prev_char_count++;
			return;
		}

		if( prev_char && prev_char_count > 1 ){
			pattern += '{'+prev_char_count+'}';
		}

		if( array[i+1] == char ){
			pattern += `(?:${char})`;
		}else{
			pattern += char;
		}

		prev_char = char;
		prev_char_count = 1;
	});

	if( prev_char_count > 1 ){
		pattern += '{'+prev_char_count+'}';
	}
	pattern += '';
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
	let array = Array.from(chars);
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
	return Array.from(str).length;
}
