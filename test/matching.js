var assert = require('assert');
var D = require('../dist/cjs/index.js');


describe('Matching', function(){

	let prep = D.initialize();
	const regExp = (needle) => {
		needle = '^'+D.getPattern(needle)+'$';
		return new RegExp(needle,'iu')
	};

	/**
	 * @param {string[]} combos
	 * @param {boolean} debug
	 */
	const testCombos = (combos,debug=false) => {

		combos.forEach((stra, i) => {

			let regex = regExp(stra);

			combos.forEach((strb, j) => {

				let r		= regex.test(strb);
				let msg		= `stra(${i}) ${stra} strb(${j}) ${strb} regex ${regex} result ${r}`;
				if( debug ){
					console.log(msg);
				}
				assert.equal(r, true, msg);
			});

		});
	};


	it('abc', () => {
		let combos = ['abc'];
		testCombos(combos);
	});

	it('²³4',() =>{
		let combos = ['²³4'];
		testCombos(combos);

	});

	// "TM" should match ™, ⓉM ...
	it('TM', () => {
		let combos = ['TM','tm','™','ⓉM','Tℳ'];
		testCombos(combos);
	});

	// RSM should match "₨","M" or "R","℠"
	it('RSM', () => {
		let combos = ['RSM','₨M','R℠'];
		testCombos(combos);
	});


	it('1/4', () => {
		let combos = ['1/4','⅟4','¼'];
		testCombos(combos);
	});

	it('RSM/S', () => {
		let combos = ['RSM/S','₨㎧','R℠/S'];
		testCombos(combos);
	});

	it('ÀÁÂÃÄÅ',() =>{
		let combos = ['ÀÁÂÃÄÅ','aaaaaa'];
		testCombos(combos);
	});

	it('æⱥø',() =>{
		let combos = ['æⱥø','aeao'];
		testCombos(combos);
	});

	it('...',() =>{
		let combos = ['...','…','‥.','.‥'];
		testCombos(combos);
	});

	it('non-folding characters',() => {
		let combos = ['a\tb','A\tb'];
		testCombos(combos);
	});

	it('Should match all code points individually',()=>{


		for( let value of D.generator(D.code_points) ){

			let composed	= value.composed;
			let folded		= value.folded;
			let i			= value.code_point;

			if( folded.length == 0 ){
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


	});


	it('Should match all code points in strings',()=>{

		let composeda	= [];
		let foldeda	= [];
		let code_points	= [];

		let all_code_points = [[0,65518]];

		for( let value of D.generator(all_code_points) ){

			code_points.push(value.code_point);
			composeda.push(value.composed);
			foldeda.push(value.folded);

			if( composeda.length < 6 ){
				continue;
			}


			let composed = composeda.join('');
			let folded = foldeda.join('');

			let	regex;
			try{
				 regex = regExp(composed);
			}catch(e){
				throw new Error(`regex error for composed: ${composeda}, folded: ${foldeda} code points: ${code_points} message: ${e.message}`);
			}

			if( regex ){
				assert.equal(regex.test(composed), true, `composed should match composed for composed: ${composeda}, folded: ${foldeda} regex: ${regex} code points: ${code_points}`);
				assert.equal(regex.test(folded), true, `composed should match composed for composed: ${composeda}, folded: ${foldeda} regex: ${regex} code points: ${code_points}`);
			}

			regex = regExp(folded);
			if( regex ){
				assert.equal(regex.test(folded), true, `composed should match composed for composed: ${composeda}, folded: ${foldeda} regex: ${regex} code points: ${code_points}`);
				assert.equal(regex.test(composed), true, `composed should match composed for composed: ${composeda}, folded: ${foldeda} regex: ${regex} code points: ${code_points}`);
			}

			composeda	= [];
			foldeda	= [];
			code_points	= [];

		}


	});


});
