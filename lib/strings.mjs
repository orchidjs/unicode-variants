

/**
 * 'abcdef' => [["abc", "def"], ["ab", "cde", "f"], ["ab", "cd", "ef"], ["a", "bcd", "ef"]]
 * https://stackoverflow.com/questions/73408316/generate-minimum-number-of-sets-of-substrings-with-max-substring-length
 *
 * @param {string} input
 * @param {number} maxLen
 * @param {number} minInitLen
 */
export const getSplits = (input, maxLen, minInitLen = 1) => {

	/** @type {string[][]} */
	const result	= input.length ? [] : [[]];
	maxLen			= Math.min(maxLen, input.length);
	minInitLen		= Math.max(0, minInitLen);

	for( let i = maxLen; i >= minInitLen; i-- ){
		const subresult = getSplits(input.slice(i), maxLen, maxLen + 1 - i);
		const piece = input.slice(0, i);

		for( const s of subresult ){
			let toadd = [piece].concat(s);
			result.push(toadd);
		}
	}


	return result;
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

	const start = input.substring(1);
    const suba = allSubstrings(start);

	suba.forEach(function(subresult) {
        let tmp = subresult.slice(0);
        tmp[0] = input.charAt(0) + tmp[0];
        result.push(tmp);

        tmp = subresult.slice(0);
        tmp.unshift(input.charAt(0));
        result.push(tmp);
    });

    return result;
}
