var assert = require('assert');
var quantum = require('./quantum.js');
var bits = new quantum.Qubits(8);
assert.ok(bits);
assert.equal(bits.length, 8);
assert.equal(bits.states.length, 256);
bits.X(0);
bits.X(2);
//101
assert.ok(Math.abs(bits.states[5]-1.0)<0.00001);
for(var i=0, l=bits.length;i<l;++i){
    bits.H(i);
}
for(i=0,l=bits.states.length;i<l;++i){
    if(i&1 && !i&4 || !i&1 && i&4){
        assert.ok(bits.states[i]<0.0);
    }
}
for(i=0, l=bits.length;i<l;++i){
    bits.H(i);
}
assert.ok(Math.abs(bits.states[5]-1.0)<0.00001);
assert.equal(5, bits.measures());
assert.equal(5, bits.measures());
bits.X(0);
bits.X(2);
assert.equal(0, bits.measures());
var c0 = new quantum.Complex(1,1);
var c1 = new quantum.Complex(0,1);
var tmp = quantum.cprod(c1, c1);
assert.equal(tmp.real, -1);


