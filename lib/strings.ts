/**
 * Get all possible combinations of substrings that add up to the given string
 * https://stackoverflow.com/questions/30169587/find-all-the-combination-of-substrings-that-add-up-to-the-given-string
 */
export const allSubstrings = (input: string): string[][] => {

    if( input.length === 1) return [[input]];

    let result: string[][] = [];

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
