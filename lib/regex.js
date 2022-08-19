
/**
 * Convert array of strings to a regular expression
 *	ex ['ab','a'] => (?:ab|a)
 * 	ex ['a','b'] => [ab]
 * @param {string[]} chars
 * @param {string} glue
 * @param {boolean} escape
 * @return {string}
 */
export const arrayToPattern = (chars,glue='|',escape=false) =>{

	if( chars.length == 0 ){
		return '';
	}

	if( chars.length === 1 && chars[0] != undefined ){
		return chars[0];
	}

	let longest = maxValueLength(chars);

	// escape after checking length
	if( escape ){
		chars = chars.slice(0).map((diacritic) => escape_regex(diacritic));
	}

	if( longest == 1 && glue == '|' ){
		return '['+chars.join('')+']';
	}

	return '(?:'+chars.join(glue)+')';
};

/**
 *
 */
export const sequencePattern = (array)=>{

	if( !hasDuplicates(array) ){
		return array.join('');
	}

	let join = '';
	let prev_char;
	let prev_char_count = 0;

	array.forEach((char,i)=>{

		if( char == prev_char ){
			prev_char_count++;
			return;
		}

		if( prev_char && prev_char_count > 1 ){
			join += '{'+prev_char_count+'}';
			join += glue;
		}

		if( array[i+i] == char ){
			join += `(?:${char})`;
		}else{
			join += char;
		}

		prev_char = char;
		prev_char_count = 1;
	});

	if( prev_char_count > 1 ){
		join += '{'+prev_char_count+'}';
	}
	join += '';
	return join;

}


/**
 * @param {string[]} chars
 * @param {string} glue
 * @return {string}
 */
export const escapeToPattern = (chars,glue='|') =>{
	return arrayToPattern(chars,glue,true);
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
 * @param {string[]} str
 * @return {string}
 */
export const partsToPattern = (parts) => {

	/**
	 * @param {string} part
	 */
	let pattern = parts.map((part)=>{

		if( part == '' ){
			return '';
		}

		const no_accent = asciifold(part);
		if( no_accent == '' ){
			return '';
		}

		return diacritic_patterns[no_accent] || escape_regex(part)

	}).join('');

	return pattern;
}


/**
 * https://stackoverflow.com/questions/7376598/in-javascript-how-do-i-check-if-an-array-has-duplicate-values
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

export const maxValueLength = (array) => {
	return array.reduce( (longest, value) => Math.max(longest,unicodeLength(value)),0);
}


/**
 * @param {string} str
 */
export const unicodeLength = (str) => {
	return Array.from(str).length;
}
