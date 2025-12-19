// Strict Characteristics Schema Configuration
// Keys: category_slug OR category_slug/subcategory_slug

export interface CharacteristicField {
    key: string;          // DB key (specs json key)
    labelKey: string;     // i18n key 'characteristics.*'
    type: "string" | "boolean" | "number";
}

export const CHARACTERISTICS_SCHEMA_MAP: Record<string, CharacteristicField[]> = {
    /* 1. COMPUTERS (computers) */
    'computers/office-pc': [
        { key: "cpu", labelKey: "characteristics.cpu", type: "string" },
        { key: "ram", labelKey: "characteristics.ram", type: "string" },
        { key: "storage", labelKey: "characteristics.storage", type: "string" },
        { key: "gpu", labelKey: "characteristics.gpu_integrated", type: "string" },
        { key: "os", labelKey: "characteristics.os", type: "string" },
        { key: "case_type", labelKey: "characteristics.case_type", type: "string" },
    ],
    'computers/gaming-pc': [
        { key: "cpu", labelKey: "characteristics.cpu", type: "string" },
        { key: "ram", labelKey: "characteristics.ram", type: "string" },
        { key: "storage", labelKey: "characteristics.storage", type: "string" },
        { key: "gpu", labelKey: "characteristics.gpu", type: "string" },
        { key: "psu", labelKey: "characteristics.psu", type: "string" },
        { key: "cooling", labelKey: "characteristics.cooling", type: "string" },
        { key: "os", labelKey: "characteristics.os", type: "string" },
    ],
    'computers/workstations': [
        { key: "cpu", labelKey: "characteristics.cpu", type: "string" },
        { key: "ram", labelKey: "characteristics.ram", type: "string" },
        { key: "storage", labelKey: "characteristics.storage", type: "string" },
        { key: "gpu", labelKey: "characteristics.gpu_pro", type: "string" },
        { key: "raid", labelKey: "characteristics.raid", type: "boolean" },
        { key: "os", labelKey: "characteristics.os", type: "string" },
    ],
    'computers/aio': [ // Fallback or explicit
        { key: "screen", labelKey: "characteristics.screen", type: "string" },
        { key: "cpu", labelKey: "characteristics.cpu", type: "string" },
        { key: "ram", labelKey: "characteristics.ram", type: "string" },
        { key: "storage", labelKey: "characteristics.storage", type: "string" },
    ],

    /* 2. LAPTOPS (laptops) */
    'laptops/office-laptops': [
        { key: "screen", labelKey: "characteristics.screen_size_res", type: "string" },
        { key: "cpu", labelKey: "characteristics.cpu", type: "string" },
        { key: "ram", labelKey: "characteristics.ram", type: "string" },
        { key: "storage", labelKey: "characteristics.storage", type: "string" },
        { key: "battery", labelKey: "characteristics.battery_capacity", type: "string" },
        { key: "weight", labelKey: "characteristics.weight", type: "string" },
        { key: "os", labelKey: "characteristics.os", type: "string" },
    ],
    'laptops/gaming-laptops': [
        { key: "screen", labelKey: "characteristics.screen_gaming", type: "string" },
        { key: "cpu", labelKey: "characteristics.cpu", type: "string" },
        { key: "ram", labelKey: "characteristics.ram", type: "string" },
        { key: "storage", labelKey: "characteristics.storage", type: "string" },
        { key: "gpu", labelKey: "characteristics.gpu", type: "string" },
        { key: "battery", labelKey: "characteristics.battery", type: "string" },
        { key: "cooling", labelKey: "characteristics.cooling", type: "string" },
        { key: "weight", labelKey: "characteristics.weight", type: "string" },
    ],
    'laptops/business-laptops': [
        { key: "screen", labelKey: "characteristics.screen", type: "string" },
        { key: "cpu", labelKey: "characteristics.cpu", type: "string" },
        { key: "ram", labelKey: "characteristics.ram", type: "string" },
        { key: "storage", labelKey: "characteristics.storage", type: "string" },
        { key: "battery", labelKey: "characteristics.battery_life", type: "string" },
        { key: "weight", labelKey: "characteristics.weight", type: "string" },
        { key: "security", labelKey: "characteristics.security", type: "string" },
        { key: "os", labelKey: "characteristics.os", type: "string" },
    ],
    // Ultrabooks usually map to business or have own schema
    'laptops/ultrabooks': [
        { key: "screen", labelKey: "characteristics.screen", type: "string" },
        { key: "cpu", labelKey: "characteristics.cpu", type: "string" },
        { key: "ram", labelKey: "characteristics.ram", type: "string" },
        { key: "storage", labelKey: "characteristics.storage", type: "string" },
        { key: "weight", labelKey: "characteristics.weight", type: "string" },
    ],

    /* 3. OFFICE EQUIPMENT (office-equipment) */
    'office-equipment/printers': [
        { key: "technology", labelKey: "characteristics.technology", type: "string" }, // Laser/Inkjet
        { key: "format", labelKey: "characteristics.format", type: "string" },
        { key: "speed", labelKey: "characteristics.print_speed", type: "string" },
        { key: "color", labelKey: "characteristics.color_bw", type: "string" },
        { key: "duplex", labelKey: "characteristics.duplex", type: "boolean" },
        { key: "wifi", labelKey: "characteristics.wifi", type: "boolean" },
        { key: "ethernet", labelKey: "characteristics.ethernet", type: "boolean" },
        { key: "cartridge", labelKey: "characteristics.cartridge", type: "string" },
        { key: "ink_type", labelKey: "characteristics.ink_type", type: "string" }, // For inkjet
    ],
    'office-equipment/mfp': [
        { key: "functions", labelKey: "characteristics.functions", type: "string" }, // Print/Scan/Copy
        { key: "technology", labelKey: "characteristics.technology", type: "string" },
        { key: "format", labelKey: "characteristics.format", type: "string" },
        { key: "speed", labelKey: "characteristics.print_speed", type: "string" },
        { key: "duplex", labelKey: "characteristics.duplex", type: "boolean" },
        { key: "wifi", labelKey: "characteristics.wifi", type: "boolean" },
        { key: "scanner_type", labelKey: "characteristics.scanner_type", type: "string" },
    ],
    'office-equipment/scanners': [
        { key: "scanner_type", labelKey: "characteristics.scanner_type", type: "string" },
        { key: "resolution", labelKey: "characteristics.optical_res", type: "string" },
        { key: "speed", labelKey: "characteristics.scan_speed", type: "string" },
        { key: "adf", labelKey: "characteristics.adf", type: "boolean" },
        { key: "interface", labelKey: "characteristics.interface", type: "string" },
    ],

    /* 4. MONITORS (monitors) */
    'monitors/office-monitors': [
        { key: "screen_size", labelKey: "characteristics.screen_size", type: "string" },
        { key: "resolution", labelKey: "characteristics.resolution", type: "string" },
        { key: "panel_type", labelKey: "characteristics.panel_type", type: "string" },
        { key: "refresh_rate", labelKey: "characteristics.refresh_rate", type: "string" },
        { key: "response_time", labelKey: "characteristics.response_time", type: "string" },
        { key: "ports", labelKey: "characteristics.ports", type: "string" },
    ],
    'monitors/gaming-monitors': [
        { key: "screen_size", labelKey: "characteristics.screen_size", type: "string" },
        { key: "resolution", labelKey: "characteristics.resolution", type: "string" },
        { key: "refresh_rate", labelKey: "characteristics.refresh_rate", type: "string" },
        { key: "response_time", labelKey: "characteristics.response_time", type: "string" },
        { key: "sync", labelKey: "characteristics.sync_tech", type: "string" }, // G-Sync/FreeSync
        { key: "ports", labelKey: "characteristics.ports", type: "string" },
    ],
    'monitors/pro-monitors': [
        { key: "screen_size", labelKey: "characteristics.screen_size", type: "string" },
        { key: "resolution", labelKey: "characteristics.resolution", type: "string" },
        { key: "color_gamut", labelKey: "characteristics.color_gamut", type: "string" },
        { key: "panel_type", labelKey: "characteristics.panel_type", type: "string" },
        { key: "calibration", labelKey: "characteristics.factory_calibration", type: "boolean" },
    ],

    /* 5. COMPONENTS (components) */
    'components/cpu': [
        { key: "model", labelKey: "characteristics.model", type: "string" },
        { key: "cores", labelKey: "characteristics.cores_threads", type: "string" },
        { key: "frequency", labelKey: "characteristics.frequency", type: "string" },
        { key: "socket", labelKey: "characteristics.socket", type: "string" },
        { key: "tdp", labelKey: "characteristics.tdp", type: "string" },
    ],
    'components/ram': [
        { key: "capacity", labelKey: "characteristics.capacity", type: "string" },
        { key: "type", labelKey: "characteristics.memory_type", type: "string" },
        { key: "frequency", labelKey: "characteristics.frequency", type: "string" },
        { key: "modules", labelKey: "characteristics.modules_count", type: "string" },
    ],
    'components/drives': [
        { key: "type", labelKey: "characteristics.drive_type", type: "string" },
        { key: "capacity", labelKey: "characteristics.capacity", type: "string" },
        { key: "interface", labelKey: "characteristics.interface", type: "string" },
        { key: "speed", labelKey: "characteristics.read_write_speed", type: "string" },
    ],
    // ... earlier items
    'components/motherboards': [
        { key: "socket", labelKey: "characteristics.socket", type: "string" },
        { key: "chipset", labelKey: "characteristics.chipset", type: "string" },
        { key: "form_factor", labelKey: "characteristics.form_factor", type: "string" },
        { key: "ram_slots", labelKey: "characteristics.ram_slots", type: "string" },
    ],
    'components/psu': [
        { key: "power", labelKey: "characteristics.power", type: "string" },
        { key: "certification", labelKey: "characteristics.certification", type: "string" }, // 80 Plus
        { key: "modular", labelKey: "characteristics.modular", type: "boolean" },
    ],
    'components/cooling': [
        { key: "type", labelKey: "characteristics.cooling_type", type: "string" }, // Air/Liquid
        { key: "fan_size", labelKey: "characteristics.fan_size", type: "string" },
        { key: "tdp", labelKey: "characteristics.tdp", type: "string" },
    ],
    'components/cases': [
        { key: "form_factor", labelKey: "characteristics.form_factor", type: "string" },
        { key: "type", labelKey: "characteristics.case_type", type: "string" },
        { key: "window", labelKey: "characteristics.side_window", type: "boolean" },
    ],

    /* PERIPHERALS */
    'peripherals/webcams': [
        { key: "resolution", labelKey: "characteristics.resolution", type: "string" },
        { key: "fps", labelKey: "characteristics.fps", type: "string" },
        { key: "microphone", labelKey: "characteristics.microphone", type: "boolean" },
    ],
    'peripherals/microphones': [
        { key: "type", labelKey: "characteristics.mic_type", type: "string" }, // Condenser/Dynamic
        { key: "connection", labelKey: "characteristics.connection", type: "string" },
        { key: "pattern", labelKey: "characteristics.polar_pattern", type: "string" },
    ],
    'peripherals/gamepads': [
        { key: "platform", labelKey: "characteristics.platform", type: "string" },
        { key: "connection", labelKey: "characteristics.connection", type: "string" },
        { key: "vibration", labelKey: "characteristics.vibration", type: "boolean" },
    ],

    /* OFFICE EQUIPMENT EXTRA */
    'office-equipment/ups': [
        { key: "power_va", labelKey: "characteristics.power_va", type: "string" },
        { key: "power_watts", labelKey: "characteristics.power_watts", type: "string" },
        { key: "type", labelKey: "characteristics.ups_type", type: "string" }, // Line-Interactive
        { key: "sockets", labelKey: "characteristics.sockets", type: "string" },
    ],

    /* NETWORKING EXTRA */
    'networking/access-points': [
        { key: "wifi_std", labelKey: "characteristics.wifi_std", type: "string" },
        { key: "speed", labelKey: "characteristics.speed", type: "string" },
        { key: "poe", labelKey: "characteristics.poe", type: "boolean" },
    ],
    // Modems, Adapters share similar schema or generic

    /* STORAGE DEVICES */
    'storage-devices/external-hdd': [
        { key: "capacity", labelKey: "characteristics.capacity", type: "string" },
        { key: "form_factor", labelKey: "characteristics.form_factor", type: "string" }, // 2.5/3.5
        { key: "interface", labelKey: "characteristics.interface", type: "string" },
    ],
    'storage-devices/external-ssd': [
        { key: "capacity", labelKey: "characteristics.capacity", type: "string" },
        { key: "speed", labelKey: "characteristics.read_write_speed", type: "string" },
        { key: "interface", labelKey: "characteristics.interface", type: "string" },
    ],
    'storage-devices/usb-flash': [
        { key: "capacity", labelKey: "characteristics.capacity", type: "string" },
        { key: "interface", labelKey: "characteristics.interface", type: "string" },
        { key: "material", labelKey: "characteristics.material", type: "string" },
    ],

    /* ACCESSORIES */
    'accessories/bags': [
        { key: "type", labelKey: "characteristics.bag_type", type: "string" },
        { key: "material", labelKey: "characteristics.material", type: "string" },
        { key: "max_laptop_size", labelKey: "characteristics.max_laptop_size", type: "string" },
    ],
    // ... others generic
};
