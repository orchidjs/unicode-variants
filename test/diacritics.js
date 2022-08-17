var assert = require('assert');
var diacritics = require('../dist/cjs/diacritics.js');


describe('diacritics', function(){

	let prep = diacritics.initialize();

	// "TM" should match ™, ⓉM ...
	it('Matching "TM"', () => {
		let regex = diacritics.regExp('TM');
		assert.equal(regex.test('tm'), true);
		assert.equal(regex.test('™'), true);
		assert.equal(regex.test('ⓉM'), true);
		assert.equal(regex.test('Tℳ'), true);
	});

	// RSM should match "₨","M" or "R","℠"
	it('Matching "RSM"', () => {
		let regex = diacritics.regExp('RSM');
		assert.equal(regex.test('₨M'), true);
		assert.equal(regex.test('R℠'), true);
	});

	// RSM should match "₨","M" or "R","℠"
	it('Matching "1/4"', () => {
		let regex = diacritics.regExp('1/4');
		assert.equal(regex.test('1/4'), true);
		assert.equal(regex.test('⅟4'), true);
		assert.equal(regex.test('¼'), true);
	});

	/*
	it('Should match composed and decomposed strings', () => {

		const composed		= 'أهلا'; // '\u{623}\u{647}\u{644}\u{627}'
		const decomposed	= 'أهلا'; // '\u{627}\u{654}\u{647}\u{644}\u{627}'

		assert.notEqual(composed,decomposed);


		let regex = diacritics.regExp(composed);
		assert.equal(regex.test(composed), true);



		regex = diacritics.regExp(decomposed);
		assert.equal(regex.test(decomposed), true);

		regex = diacritics.regExp(composed);
		assert.equal(regex.test(decomposed), true);

		regex = diacritics.regExp(decomposed);
		assert.equal(regex.test(composed), true);

	});
	*/


	it('Should match all code points individually',()=>{

		const regExp = (needle) => {
			needle = '^'+diacritics.diacriticRegexPoints(needle)+'$';
			return new RegExp(needle,'iu')
		};

		for( let value of diacritics.generator(diacritics.code_points) ){

			let composed	= value.composed;
			let folded		= value.folded;
			let i			= value.code_point;

			if( folded.length == 0 ){
				continue;
			}

			//if( composed.trim().length == 0 ){
			//	continue;
			//}


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


	});


	it('Should match all code points in strings',()=>{

		let composeda	= [];
		let decomposeda	= [];
		let code_points	= [];

		for( let value of diacritics.generator(diacritics.code_points) ){

			code_points.push(value.code_point);
			composeda.push(value.composed);
			decomposeda.push(value.folded);

			if( composeda.length < 2 ){
				continue;
			}


			let composed = composeda.join('');
			let decomposed = decomposeda.join('');

			let regex = diacritics.regExp(composed);
			if( regex ){
				assert.equal(regex.test(composed), true, `composed should match composed for composed: ${composeda}, decomposed: ${decomposeda} regex: ${regex} code points: ${code_points}`);
				assert.equal(regex.test(decomposed), true, `composed should match composed for composed: ${composeda}, decomposed: ${decomposeda} regex: ${regex} code points: ${code_points}`);
			}

			regex = diacritics.regExp(decomposed);
			if( regex ){
				assert.equal(regex.test(decomposed), true, `composed should match composed for composed: ${composeda}, decomposed: ${decomposeda} regex: ${regex} code points: ${code_points}`);
				assert.equal(regex.test(composed), true, `composed should match composed for composed: ${composeda}, decomposed: ${decomposeda} regex: ${regex} code points: ${code_points}`);
			}

			composeda	= [];
			decomposeda	= [];
			code_points	= [];

		}


	});


});
