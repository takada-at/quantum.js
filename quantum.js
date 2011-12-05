/**
 * 複素数
 */
function Complex(real, imagin){
    this.real = real;
    this.imagin = imagin;
}
Complex.prototype.toString = function(){
    if(this.imagin==0)
        return this.real.toString();
    else{
        var res = '';
        if(this.real != 0)
            res += this.real.toString() + ' + ';
        if(this.imagin != 1)
            return res + this.imagin.toString() + "i";
        else
            return res + "i";
    }
};
function cplus(v0, v1){
    if(v0.constructor!=Complex && v1.constructor!=Complex)
        return v0+v1;
    if(v0.constructor!=Complex)
        v0 = new Complex(v0, 0);
    if(v1.constructor!=Complex)
        v1 = new Complex(v1, 0);
    return new Complex(v0.real + v1.real,
                       v0.imagin + v1.imagin);
}
function cprod(v0, v1){
    if(v0.constructor!=Complex && v1.constructor!=Complex)
        return v0*v1;
    if(v0.constructor!=Complex)
        v0 = new Complex(v0, 0);
    if(v1.constructor!=Complex)
        v1 = new Complex(v1, 0);
    return new Complex(v0.real * v1.real - v0.imagin * v1.imagin,
                       v0.real * v1.imagin + v0.imagin * v1.real);
}
function cdiv(v0, v1){
    if(v0.constructor!=Complex && v1.constructor!=Complex)
        return v0 / v1;
    if(v1.constructor!=Complex)
        v1 = new Complex(1.0/v1, 0);
    else
        v1 = new Complex(1.0/v1.real, 1.0/v1.imagin);
    return cprod(v0, v1);
}
function square(n){
    if(n.constructor==Complex)
        return square(n.real) + square(n.imagin);
    else
        return n*n;
}
/**
 * 行列×ベクトル
 */
function mvprod(mat0, v1){
    var res = new Array(mat0.length);
    for(var i=0;i<mat0.length;++i){
        var row = 0;
        for(var j=0;j<v1.length;++j){
            row = cplus(row, cprod(mat0[i][j], v1[j]));
        }
        res[i] = row;
    }
    return res;
}
/**
 * 量子ビットクラス
 * length個のビットを持つ量子ビットインスタンス
 */
function Qubits(length){
    this.length = length;
    var statelen = Math.pow(2, length);
    this.states = new Array(statelen);
    this.states[0] = 1.0;
    this.state_length = statelen;
    for(var i=1;i<statelen;++i){
        this.states[i] = 0.0;
    }
}
/**
 * 定数
 * 主に変換行列
 */
var SQRT2 = Math.sqrt(2);
var ID   = [[1, 0],
            [0, 1]];
var NOT  = [[0, 1],
            [1, 0]];
var X    = NOT;
var Z    = [[0, 0],
            [0, -1]];
var H    = [[1.0/SQRT2, 1.0/SQRT2],
            [1.0/SQRT2, -1.0/SQRT2]];
var CNOT = [[1, 0, 0, 0],
            [0, 1, 0, 0],
            [0, 0, 0, 1],
            [0, 0, 1, 0]];
var consts = {
    SQRT2: SQRT2, ID: ID,
    NOT: NOT, X: X, Z:Z,
    H: H, CNOT:CNOT
};
/**
 * n番目のビットを観測する
 */
Qubits.prototype.measure = function(n){
    var bit = 1<<n;
    var sumprod = 0;
    var val = 0; var prob;
    for(var i=0;i<this.state_length;++i){
        if(i&bit){
            sumprod += square(this.states[i]);
        }
    }
    if(Math.random() < sumprod){
        prob = Math.sqrt(sumprod);
        val = 1;
        for(i=0;i<this.state_length;++i){
            if(i&bit){
                cdiv(this.states[i], prob);
            }else{
                this.states[i] = 0.0;
            }
        }
    }else{
        prob = Math.sqrt(1.0 - sumprod);
        for(i=0;i<this.state_length;++i){
            if(i&bit){
                this.states[i] = 0.0;
            }else{
                cdiv(this.states[i], prob);
            }
        }
    }
    return val;
};
/**
 * 全体を観測
 */
Qubits.prototype.measures = function(_n, _m){
    var n = _n || 0;
    var m = _m || this.length;
    var r = 0;
    for(var i=n;i<m;++i){
        if(this.measure(i)==1){
            r += 1<<i;
        }
    }
    return r;
};
/**
 * 1ビットに行列を作用させる
 */
Qubits.prototype.op = function(n, mat){
    var bit = 1 << n;
    for(var i=0;i<this.states.length;++i){
        if(i&bit){
            var r = mvprod(mat, [this.states[i^bit],
                                 this.states[i]]);
            this.states[i^bit] = r[0];
            this.states[i]     = r[1];
        }
    }
};
/**
 * CNOT
 */
Qubits.prototype.CNOT = function(n, m){
    var bit0 = 1 << n;
    var bit1 = 1 << m;
    for(var i=0;i<this.states.length;++i){
        if(i&bit0 && i&bit1){
            //bit0がONのときbit1を反転
            var tmp = this.states[i];
            this.states[i]      = this.states[i^bit1];
            this.states[i^bit1] = tmp;
        }
    }
};
Qubits.prototype.H = function(n){
    this.op(n, H);
};
Qubits.prototype.X = function(n){
    this.op(n, X);
};
Qubits.prototype.toString = function(){
    var states = [];
    for(var i=0;i<this.state_length;++i){
        states.push('('+this.states[i].toString() + ')|' + i.toString() + ">\n");
    }
    var s = states.join(' + ');
    return 'length: ' + this.length + "\nstates: \n" + s;
};
if(exports){
    exports.Qubits = Qubits;
    exports.Complex = Complex;
    exports.cprod = cprod;
}