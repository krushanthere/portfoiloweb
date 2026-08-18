import * as THREE from "three";

export const QuoteSphereShader = {
  uniforms: {
    uAtlas: { value: null as THREE.Texture | null },
    uProgress: { value: 0.0 }, // 0.0 = intact sphere, 1.0 = fully exploded
    uTime: { value: 0.0 },
    uCameraPos: { value: new THREE.Vector3(0, 0, 4.5) },
    uGlowIntensity: { value: 1.0 },
  },

  vertexShader: /* glsl */ `
    uniform float uProgress;
    uniform float uTime;
    uniform vec3 uCameraPos;

    attribute vec3 aBasePos;
    attribute vec3 aExplodeDir;
    attribute vec4 aGlyphUV; // (u, v, width, height)
    attribute float aSpeed;
    attribute vec3 aRotSpeed;
    attribute vec3 aCurl;

    varying vec2 vUv;
    varying float vFacing;
    varying float vAlpha;
    varying float vProgress;

    // Rotation helper
    mat3 rotationMatrix(vec3 axis, float angle) {
      axis = normalize(axis);
      float s = sin(angle);
      float c = cos(angle);
      float oc = 1.0 - c;
      return mat3(
        oc * axis.x * axis.x + c,           oc * axis.x * axis.y - axis.z * s,  oc * axis.z * axis.x + axis.y * s,
        oc * axis.x * axis.y + axis.z * s,  oc * axis.y * axis.y + c,           oc * axis.y * axis.z - axis.x * s,
        oc * axis.z * axis.x - axis.y * s,  oc * axis.y * axis.z + axis.x * s,  oc * axis.z * axis.z + c
      );
    }

    void main() {
      // Map local quad UV to character's atlas slice
      vUv = vec2(aGlyphUV.x + uv.x * aGlyphUV.z, aGlyphUV.y + uv.y * aGlyphUV.w);
      vProgress = uProgress;

      // 1. Base intact position
      vec3 pos = aBasePos;

      // 2. Explosion kinematics
      float p = smoothstep(0.0, 1.0, uProgress);
      
      // Multi-stage velocity curve: burst deceleration + outward drift
      float travelDist = p * aSpeed * 4.2;
      vec3 dispersion = aExplodeDir * travelDist;
      
      // Organic curl noise drift
      vec3 curlDrift = aCurl * (sin(uTime * 1.5 + aSpeed * 10.0) * 0.15 + p * 0.8);
      
      pos += dispersion + curlDrift;

      // 3. Local glyph orientation & per-particle tumbling on explosion
      vec3 normalDir = normalize(aBasePos);
      
      // Tangent basis to orient glyph along sphere surface
      vec3 up = vec3(0.0, 1.0, 0.0);
      if (abs(normalDir.y) > 0.95) up = vec3(1.0, 0.0, 0.0);
      vec3 tangent = normalize(cross(up, normalDir));
      vec3 bitangent = cross(normalDir, tangent);
      
      // Local quad offset (scaled down for crisp glyph size)
      vec3 localQuad = (position.x * tangent + position.y * bitangent) * 0.085;

      // Tumble particle as explosion increases
      if (p > 0.01) {
        float rotAngle = p * length(aRotSpeed) * 3.5 + uTime * 0.5 * (aSpeed - 1.0);
        vec3 rotAxis = normalize(aRotSpeed + vec3(0.001));
        mat3 rotM = rotationMatrix(rotAxis, rotAngle);
        localQuad = rotM * localQuad;
      }

      // Final world position
      vec4 worldPos = modelMatrix * vec4(pos + localQuad, 1.0);
      
      // Depth cueing: calculate facing relative to camera in world space
      vec3 worldNormal = normalize(mat3(modelMatrix) * normalDir);
      vec3 viewDir = normalize(uCameraPos - worldPos.xyz);
      
      // Facing dot: > 0.0 when facing viewer (bright), < 0.0 when on far side (dim)
      vFacing = dot(worldNormal, viewDir);

      // Dissolve alpha when explosion finishes
      vAlpha = 1.0 - smoothstep(0.75, 1.0, uProgress);

      gl_Position = projectionMatrix * viewMatrix * worldPos;
    }
  `,

  fragmentShader: /* glsl */ `
    uniform sampler2D uAtlas;
    uniform float uGlowIntensity;

    varying vec2 vUv;
    varying float vFacing;
    varying float vAlpha;
    varying float vProgress;

    void main() {
      vec4 texColor = texture2D(uAtlas, vUv);
      
      // Glyph mask
      float glyphAlpha = texColor.a * texColor.r;
      if (glyphAlpha < 0.15) {
        discard;
      }

      // Depth cueing: front glyphs are #FFFFFF, back glyphs are dimmed to #444444 / #666666
      // vFacing ranges from -1.0 to 1.0
      float frontRatio = clamp((vFacing + 0.3) / 1.3, 0.0, 1.0);
      
      // Strict palette: pure white (#FFFFFF), light silver (#D0D0D0), muted gray (#555555)
      vec3 backColor = vec3(0.33, 0.33, 0.33); // #555555
      vec3 midColor = vec3(0.81, 0.81, 0.81);  // #D0D0D0
      vec3 frontColor = vec3(1.0, 1.0, 1.0);   // #FFFFFF

      vec3 color = mix(backColor, mix(midColor, frontColor, frontRatio), frontRatio);

      // Subtle white glow around glyph center
      float centerGlow = smoothstep(0.0, 1.0, glyphAlpha) * 0.25 * uGlowIntensity;
      color += vec3(centerGlow);

      // Scroll explosion fade
      float finalAlpha = glyphAlpha * vAlpha;

      gl_FragColor = vec4(color, finalAlpha);
    }
  `,
};
