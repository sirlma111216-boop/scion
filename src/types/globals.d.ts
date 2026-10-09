// Web Bluetooth 최소 타입과 @vernier/godirect 모듈 선언(패키지 exports 가 types 를 노출하지 않음)
interface BluetoothRequestDeviceOptions {
  filters?: { namePrefix?: string; name?: string; services?: string[] }[];
  optionalServices?: string[];
  acceptAllDevices?: boolean;
}
interface BluetoothDevice {
  id: string;
  name?: string;
  gatt?: unknown;
}
interface Bluetooth {
  requestDevice(options: BluetoothRequestDeviceOptions): Promise<BluetoothDevice>;
  getAvailability?(): Promise<boolean>;
}
interface Navigator {
  bluetooth?: Bluetooth;
}

declare module '@vernier/godirect' {
  const godirect: {
    createDevice(nativeDevice: unknown, config?: { open?: boolean; startMeasurements?: boolean }): Promise<unknown>;
    selectDevice(bluetooth?: boolean): Promise<unknown>;
  };
  export default godirect;
}
