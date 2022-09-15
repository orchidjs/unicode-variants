/**
 * Generate a flamegraph with 0x
 * Usage:
 * 	> npm run bench
 */
import * as D from './lib/index.mjs';
import * as assert from 'assert';

const regExp = (needle) => {
	needle = '^'+D.getPattern(needle)+'$';
	return new RegExp(needle,'iu')
};

for( let value of D.generator(D.code_points) ){

	let composed	= value.composed;
	let folded		= value.folded;
	let i			= value.code_point;

	if( folded.length == 0 ){
		continue;
	}

	if( composed.trim().length == 0 ){
		continue;
	}


	let regex = regExp(composed);
	if( regex ){
		assert.equal(regex.test(composed), true, 'composed should match composed for composed: ' + composed + ', folded: ' + folded + ', regex: '+regex+' code point: '+i);
		assert.equal(regex.test(folded), true, 'composed should match folded for composed: ' + composed + ', folded: ' + folded + ', regex: '+regex+' code point: '+i);
	}


	regex = regExp(folded);
	if( regex ){
		assert.equal(regex.test(folded), true, 'folded should match composed for composed: ' + composed + ', folded: ' + folded + ', regex: '+regex+' code point: '+i);
		assert.equal(regex.test(composed), true, 'folded should match composed for composed: ' + composed + ', folded: ' + folded + ', regex: '+regex+' code point: '+i);
	}

};
