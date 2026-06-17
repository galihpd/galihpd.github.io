/**
 * OkTopo Web - Programmatic Face Base Generator
 * Generates a clean, quad-based circular face mask with human-like proportions.
 */

function createFaceBaseGeometry(resolution = 24) {
  const THREE = window.THREE;
  if (!THREE) {
    console.error("Three.js is not loaded!");
    return null;
  }

  const geometry = new THREE.BufferGeometry();
  const vertices = [];
  const uvs = [];
  const indices = [];

  const size = resolution;
  const halfSize = size / 2;

  // Generate vertices
  for (let i = 0; i <= size; i++) {
    const vVal = (i / size) * 2 - 1; // Range [-1, 1] (Vertical: chin to forehead)

    for (let j = 0; j <= size; j++) {
      const uVal = (j / size) * 2 - 1; // Range [-1, 1] (Horizontal: left to right)

      // 1. Map square coordinates to a unit circle/oval (Shirley-Chiu / Elliptical mapping)
      // This ensures the face mask has an oval outline with regular quad grid density.
      let x = uVal * Math.sqrt(1 - (vVal * vVal) / 2);
      let y = vVal * Math.sqrt(1 - (uVal * uVal) / 2);

      // 2. Adjust proportions to look like a human head/face
      // Taper the jaw (narrower at the bottom, wider at the top)
      if (y < 0.1) {
        // As y goes from 0.1 down to -1, scale x down slightly (tapering the jaw)
        const taperFactor = 1.0 + 0.32 * (y - 0.1); 
        x *= taperFactor;
      }
      
      // Make the forehead slightly wider
      if (y > 0.4) {
        x *= (1.0 + 0.1 * (y - 0.4));
      }

      // 3. Shape the 3D depth (Z coordinate) using a combination of base curve and features
      // Base dome curvature (spherical mask)
      let z = -0.45 * (x * x + y * y);

      // Nose bridge protrusion (Gaussian bump slightly below the center)
      const noseX = x;
      const noseY = y + 0.08; // Shift nose slightly up from bottom
      const noseWidthX = 0.05;
      const noseWidthY = 0.12;
      const noseHeight = 0.35;
      const noseBump = noseHeight * Math.exp(-( (noseX * noseX) / noseWidthX + (noseY * noseY) / noseWidthY ));
      z += noseBump;

      // Nose tip definition (extra small bump at nose end)
      const tipX = x;
      const tipY = y + 0.12;
      const tipBump = 0.08 * Math.exp(-( (tipX * tipX) / 0.02 + (tipY * tipY) / 0.02 ));
      z += tipBump;

      // Eye socket hollows (two depressions)
      const leftEyeX = x - 0.28;
      const leftEyeY = y - 0.22; // Eyes are positioned in upper half
      const eyeWidth = 0.035;
      const eyeDepth = -0.09;
      const leftEyeHollow = eyeDepth * Math.exp(-( (leftEyeX * leftEyeX) / eyeWidth + (leftEyeY * leftEyeY) / 0.03 ));
      z += leftEyeHollow;

      const rightEyeX = x + 0.28;
      const rightEyeY = y - 0.22;
      const rightEyeHollow = eyeDepth * Math.exp(-( (rightEyeX * rightEyeX) / eyeWidth + (rightEyeY * rightEyeY) / 0.03 ));
      z += rightEyeHollow;

      // Brow ridge protrusion (above eye sockets)
      const browX = x;
      const browY = y - 0.38;
      const browRidge = 0.06 * Math.exp(-( (browX * browX) / 0.3 + (browY * browY) / 0.015 ));
      z += browRidge;

      // Mouth groove / lips protrusion
      const mouthX = x;
      const mouthY = y + 0.32; // Mouth in lower half
      const mouthHollow = -0.03 * Math.exp(-( (mouthX * mouthX) / 0.09 + (mouthY * mouthY) / 0.015 ));
      const lipsBump = 0.045 * Math.exp(-( (mouthX * mouthX) / 0.06 + (mouthY * mouthY) / 0.008 ));
      z += mouthHollow + lipsBump;

      // Chin bump
      const chinX = x;
      const chinY = y + 0.7;
      const chinBump = 0.06 * Math.exp(-( (chinX * chinX) / 0.04 + (chinY * chinY) / 0.04 ));
      z += chinBump;

      // Cheekbone volume
      const lCheekX = x - 0.45;
      const rCheekX = x + 0.45;
      const cheekY = y + 0.05;
      const cheekVol = 0.05 * Math.exp(-( (cheekY * cheekY) / 0.08 ));
      z += cheekVol * Math.exp(-( (lCheekX * lCheekX) / 0.06 )) + cheekVol * Math.exp(-( (rCheekX * rCheekX) / 0.06 ));

      // Push vertices to positions array
      // Standardize dimensions: height is roughly 2.0 units, width is 1.6 units, depth is ~0.6 units
      const scaleFactor = 1.2;
      vertices.push(x * scaleFactor, y * scaleFactor, z * scaleFactor);

      // Generate UV mapping coordinates [0, 1]
      // Map uVal/vVal from [-1, 1] to [0, 1]
      const u = (uVal + 1) / 2;
      const v = (vVal + 1) / 2;
      uvs.push(u, v);
    }
  }

  // Generate face indices (Quads converted to triangles)
  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      // Index of vertices in the flat array
      const a = i * (size + 1) + j;
      const b = i * (size + 1) + (j + 1);
      const c = (i + 1) * (size + 1) + (j + 1);
      const d = (i + 1) * (size + 1) + j;

      // Create two triangles for each quad
      // Triangle 1: a -> b -> d
      indices.push(a, b, d);
      // Triangle 2: b -> c -> d
      indices.push(b, c, d);
    }
  }

  // Set attributes to geometry
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);

  // Compute normals for proper lighting
  geometry.computeVertexNormals();

  return geometry;
}

// Export functions to global scope so they can be loaded by app.js
window.createFaceBaseGeometry = createFaceBaseGeometry;
