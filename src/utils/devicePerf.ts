export interface DevicePerfProfile {
  isMobile: boolean;
  isLowEnd: boolean;
  isUltraLowEnd: boolean;
  isSoftwareGl: boolean;
  hwCores: number;
  hwMemGb: number;
  gpuName: string;
}

let cachedProfile: DevicePerfProfile | null = null;

export function getDevicePerfProfile(): DevicePerfProfile {
  if (cachedProfile) return cachedProfile;

  const isMobile =
    typeof navigator !== 'undefined' &&
    (/Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent) ||
      (navigator.maxTouchPoints > 1 &&
        typeof window !== 'undefined' &&
        window.innerWidth <= 1024));

  const hwCores = typeof navigator !== 'undefined' ? navigator.hardwareConcurrency || 4 : 4;
  const hwMemGb =
    typeof navigator !== 'undefined'
      ? (navigator as Navigator & { deviceMemory?: number }).deviceMemory || 4
      : 4;
  const saveData = Boolean(
    typeof navigator !== 'undefined' &&
      (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData,
  );

  let isSoftwareGl = false;
  let gpuName = '';

  if (typeof document !== 'undefined') {
    try {
      const c = document.createElement('canvas');
      const gl = c.getContext('webgl2') || c.getContext('webgl');
      if (!gl) {
        isSoftwareGl = true;
      } else {
        const ext = gl.getExtension('WEBGL_debug_renderer_info');
        const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
        gpuName = String(gl.getParameter(param) || '');
        isSoftwareGl = /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpuName);
        gl.getExtension('WEBGL_lose_context')?.loseContext();
      }
    } catch {
      isSoftwareGl = true;
    }
  }

  const weakGpu = /Mali-G5[0-2]|Mali-T|Adreno \(TM\) 5|Adreno \(TM\) 610|PowerVR/i.test(gpuName);
  const ultraWeakGpu =
    /Mali-4|Mali-T7|Mali-T8|Adreno \(TM\) 3|Adreno \(TM\) 4|Adreno \(TM\) 50|PowerVR SGX|PowerVR GE8|Spreadtrum|Unisoc/i.test(
      gpuName,
    );

  const isLowEnd = isMobile && (hwCores <= 4 || hwMemGb <= 3 || saveData || weakGpu || ultraWeakGpu);
  const isUltraLowEnd =
    isSoftwareGl ||
    (isMobile && (hwMemGb <= 2 || (hwCores <= 4 && hwMemGb <= 3) || saveData || ultraWeakGpu));

  cachedProfile = {
    isMobile,
    isLowEnd: isLowEnd || isUltraLowEnd,
    isUltraLowEnd,
    isSoftwareGl,
    hwCores,
    hwMemGb,
    gpuName,
  };
  return cachedProfile;
}
