// Fraud/multi-account gözlemi için Prometheus metrikleri
export const fraudMetrics = {
  multiuser_ip_count: 0, // >=2 farklı kullanıcıdan login yapılan IP sayısı
  multiuser_device_count: 0 // >=2 farklı kullanıcıdan login yapılan device fingerprint sayısı
};

export function setMultiuserIpCount(val){ fraudMetrics.multiuser_ip_count = val; }
export function setMultiuserDeviceCount(val){ fraudMetrics.multiuser_device_count = val; }
