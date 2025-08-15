// Facade taslağı: Mevcut servisleri modül arayüzü üzerinden dışa açar
export async function getTrustOffset({ limit, offset }) {
  const mod = await import('../../../services/userService.js');
  if (typeof mod.getTrustOffset !== 'function') {
    throw new Error('getTrustOffset service not found');
  }
  return mod.getTrustOffset({ limit, offset });
}
