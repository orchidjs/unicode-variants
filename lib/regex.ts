/**
 * Convert array of strings to a regular expression
 *	ex ['ab','a'] => (?:ab|a)
 * 	ex ['a','b'] => [ab]
 */
export const arrayToPattern = (chars: string[]): string => {

	chars = chars.filter( Boolean );

	if( chars.length < 2 ){
		return chars[0] || '';
	}

	return (maxValueLength(chars) == 1) ? '['+chars.join('')+']' : '(?:'+chars.join('|')+')';
};

export const sequencePattern = (array: string[]): string => {

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
 */
export const setToPattern = (chars: Set<string>): string => {
	let array = Array.from(chars);
	return arrayToPattern(array);
}



/**
 * https://stackoverflow.com/questions/7376598/in-javascript-how-do-i-check-if-an-array-has-duplicate-values
 */
export const hasDuplicates = (array: any[]) => {
    return (new Set(array)).size !== array.length;
}


/**
 * https://stackoverflow.com/questions/63006601/why-does-u-throw-an-invalid-escape-error
 */
export const escape_regex = (str: string): string => {
	return (str + '').replace(/([\$\(\)\*\+\.\?\[\]\^\{\|\}\\])/gu, '\\$1');
};

/**
 * Return the max length of array values
 */
export const maxValueLength = (array: string[]) => {
	return array.reduce( (longest, value) => Math.max(longest,unicodeLength(value)),0);
}


export const unicodeLength = (str: string) => {
	return Array.from(str).length;
}
