


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
