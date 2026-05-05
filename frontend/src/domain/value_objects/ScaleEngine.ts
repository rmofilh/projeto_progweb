import { DeviceScale } from "./DeviceScale";

export class ScaleEngine {
  /**
   * Calcula o fator de escala (CSS scale) necessário para que um objeto
   * com uma referência em CM seja exibido no tamanho físico real.
   * 
   * @param cmReference A dimensão física que o objeto representa (em cm)
   * @param naturalPixelSize O tamanho natural do objeto em pixels (ex: largura da imagem)
   * @param deviceScale A calibração atual do dispositivo (pixels por cm)
   */
  static calculateScaleFactor(
    cmReference: number,
    naturalPixelSize: number,
    deviceScale: DeviceScale
  ): number {
    if (naturalPixelSize === 0) return 1;
    
    const desiredPixels = cmReference * deviceScale.pixelsPerCm;
    return desiredPixels / naturalPixelSize;
  }

  /**
   * Converte uma medida física em pixels com base na calibração.
   */
  static cmToPixels(cm: number, deviceScale: DeviceScale): number {
    return cm * deviceScale.pixelsPerCm;
  }
}
