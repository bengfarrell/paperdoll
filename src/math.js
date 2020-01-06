/* Mike Marrotte (marrotte@gmail.com) 9/26/2013 */
/* Computing plane projective transformation */
/* as described here http://tpgit.github.io/Leptonica/projective_8c_source.html */
/* and here http://homepages.inf.ed.ac.uk/rbf/CVonline/LOCAL_COPIES/EPSRC_SSAZ/epsrc_ssaz.html */
/* Requires Sylvester's Vector and JavaScript lib found here http://sylvester.jcoglan.com */

/* Given 4 source points and their respective 4 transformed points, solve aH=b, return H -- the coefficients used to transform by get_xprime and get_yprime */
export function estimate_H(x1, y1, x2, y2, x3, y3, x4, y4, u1, v1, u2, v2, u3, v3, u4, v4){

    var a = Matrix.create([
        [x1, y1, 1,  0,  0, 0, -x1*u1, -y1*u1 ],
        [ 0,  0, 0, x1, y1, 1, -x1*v1, -y1*v1 ],
        [x2, y2, 1,  0,  0, 0, -x2*u2, -y2*u2 ],
        [ 0,  0, 0, x2, y2, 1, -x2*v2, -y2*v2 ],
        [x3, y3, 1,  0,  0, 0, -x3*u3, -y3*u3 ],
        [ 0,  0, 0, x3, y3, 1, -x3*v3, -y3*v3 ],
        [x4, y4, 1,  0,  0, 0, -x4*u4, -y4*u4 ],
        [ 0,  0, 0, x4, y4, 1, -x4*v4, -y4*v4 ]
    ]);

    var b = Matrix.create([
        [u1],
        [v1],
        [u2],
        [v2],
        [u3],
        [v3],
        [u4],
        [v4]
    ]);

    //solve aH=b
    var a_inv = a.inverse();
    var H = a_inv.multiply(b);
    return H;
}

function get_xprime(x, y, H){
    return  (H.e(1,1)*x+H.e(2,1)*y+H.e(3,1)) / (H.e(7,1)*x+H.e(8,1)*y+1);
}

function get_yprime(x, y, H){
    return  (H.e(4,1)*x+H.e(5,1)*y+H.e(6,1)) / (H.e(7,1)*x+H.e(8,1)*y+1);
}

