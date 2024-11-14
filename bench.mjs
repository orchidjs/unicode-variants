/**
 * Generate a flamegraph with 0x
 * Usage:
 * 	> npm run bench
 */
import * as D from './dist/esm/index.js';
import * as assert from 'assert';

const regExp = (needle) => {
	needle = '^'+D.getPattern(needle)+'$';
	return new RegExp(needle,'iu')
};

let composeda		= [];
let foldeda			= [];
let code_points		= [];
let slowest			= [];
let slowest_time	= 0;

let all_code_points = [[0,65518]];

for( let value of D.generator(all_code_points) ){

	code_points.push(value.code_point);
	composeda.push(value.composed);
	foldeda.push(value.folded);

	if( composeda.length < 11 ){
		continue;
	}

	let start = Date.now();

	let composed = composeda.join('');
	let folded = foldeda.join('');

	let	regex;
	try{
		 regex = regExp(composed);
	}catch(e){
		throw new Error(`regex error for composed: ${composeda}, folded: ${foldeda} code points: ${code_points} message: ${e.message}`);
	}

	if( regex ){
		assert.equal(regex.test(composed), true, `composed should match composed for composed: ${composeda}, folded: ${foldeda} code points: ${code_points}`);
		assert.equal(regex.test(folded), true, `composed should match composed for composed: ${composeda}, folded: ${foldeda} code points: ${code_points}`);
	}

	regex = regExp(folded);
	if( regex ){
		assert.equal(regex.test(folded), true, `composed should match composed for composed: ${composeda}, folded: ${foldeda} code points: ${code_points}`);
		assert.equal(regex.test(composed), true, `composed should match composed for composed: ${composeda}, folded: ${foldeda} code points: ${code_points}`);
	}

	composeda	= [];
	foldeda	= [];
	code_points	= [];

	let elapsed = Date.now() - start;

	if( elapsed > slowest_time ){
		slowest_time = elapsed;
		slowest = code_points;
	}

}
