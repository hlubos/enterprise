function t(t, o, r) {
  var i = t, e = o, s = r, p = Math.sqrt(Math.pow(i.x - e.x, 2) + Math.pow(i.y - e.y, 2)), n = Math.sqrt(Math.pow(i.x - s.x, 2) + Math.pow(i.y - s.y, 2)), a = Math.sqrt(Math.pow(e.x - s.x, 2) + Math.pow(e.y - s.y, 2)), h = (Math.pow(p, 2) + Math.pow(n, 2) - Math.pow(a, 2)) / (2 * p * n);
  return Math.round(180 * Math.acos(h) / Math.PI);
}

Object.defineProperty(exports, "__esModule", {
  value: !0
}), exports.getJointAngle = t, exports.judgeIsStand = function(r) {
  var i = t(r[13].position, r[11].position, r[15].position);
  t(r[14].position, r[12].position, r[16].position) > 160 && i > 160 ? o++ : o = 0;
  if (o > 2) return o = 0, !0;
  return !1;
}, exports.isInsideRect = function(t, o) {
  for (var r = t[0], i = t[1], e = !1, s = 0, p = o.length - 1; s < o.length; p = s++) {
      var n = o[s][0], a = o[s][1], h = o[p][0], y = o[p][1];
      a > i != y > i && r < (h - n) * (i - a) / (y - a) + n && (e = !e);
  }
  return e;
}, exports.formatKeypoints = function(t, o, r) {
  var i = [];
  if (t[0].keypoints.forEach(function(t, e) {
      var s = t;
      i.push({
          score: 1,
          keypoints: [ {
              position: {
                  y: s[0][1] * r,
                  x: s[0][0] * o
              },
              part: "nose",
              score: s[0][2]
          }, {
              position: {
                  y: s[16][1] * r,
                  x: s[16][0] * o
              },
              part: "leftEye",
              score: s[16][2]
          }, {
              position: {
                  y: s[15][1] * r,
                  x: s[15][0] * o
              },
              part: "rightEye",
              score: s[15][2]
          }, {
              position: {
                  y: s[18][1] * r,
                  x: s[18][0] * o
              },
              part: "leftEar",
              score: s[18][2]
          }, {
              position: {
                  y: s[17][1] * r,
                  x: s[17][0] * o
              },
              part: "rightEar",
              score: s[17][2]
          }, {
              position: {
                  y: s[5][1] * r,
                  x: s[5][0] * o
              },
              part: "leftShoulder",
              score: s[5][2]
          }, {
              position: {
                  y: s[2][1] * r,
                  x: s[2][0] * o
              },
              part: "rightShoulder",
              score: s[2][2]
          }, {
              position: {
                  y: s[6][1] * r,
                  x: s[6][0] * o
              },
              part: "leftElbow",
              score: s[6][2]
          }, {
              position: {
                  y: s[3][1] * r,
                  x: s[3][0] * o
              },
              part: "rightElbow",
              score: s[3][2]
          }, {
              position: {
                  y: s[7][1] * r,
                  x: s[7][0] * o
              },
              part: "leftWrist",
              score: s[7][2]
          }, {
              position: {
                  y: s[4][1] * r,
                  x: s[4][0] * o
              },
              part: "rightWrist",
              score: s[4][2]
          }, {
              position: {
                  y: s[12][1] * r,
                  x: s[12][0] * o
              },
              part: "leftHip",
              score: s[12][2]
          }, {
              position: {
                  y: s[9][1] * r,
                  x: s[9][0] * o
              },
              part: "rightHip",
              score: s[9][2]
          }, {
              position: {
                  y: s[13][1] * r,
                  x: s[13][0] * o
              },
              part: "leftKnee",
              score: s[13][2]
          }, {
              position: {
                  y: s[10][1] * r,
                  x: s[10][0] * o
              },
              part: "rightKnee",
              score: s[10][2]
          }, {
              position: {
                  y: s[14][1] * r,
                  x: s[14][0] * o
              },
              part: "leftAnkle",
              score: s[14][2]
          }, {
              position: {
                  y: s[11][1] * r,
                  x: s[11][0] * o
              },
              part: "rightAnkle",
              score: s[11][2]
          } ]
      });
  }), i.length) return i;
};

var o = 0;