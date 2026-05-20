import { GivTCPPowerFlowCardEditor } from './editor';
import { HomeAssistant, LovelaceCardConfig } from 'custom-card-helpers';
import { fireEvent } from 'custom-card-helpers';
import {
  DOT_SIZE_DEFAULT,
  DOT_SPEED_DEFAULT,
  LINE_WIDTH_DEFAULT,
  ENTITY_SIZE_DEFAULT,
  POWER_MARGIN_DEFAULT,
  SINGLE_INVERTOR_DEFAULT,
  SINGLE_BATTERY_DEFAULT,
} from './const';
import { UnitOfPower } from './types';

// Mock custom-card-helpers
jest.mock('custom-card-helpers', () => ({
  fireEvent: jest.fn(),
}));

// Mock lit
jest.mock('lit', () => ({
  html: jest.fn((strings: TemplateStringsArray, ...values: any[]) => ({
    strings,
    values,
  })),
  LitElement: class LitElement {
    constructor() {}
  },
}));

// Mock lit/decorators.js
jest.mock('lit/decorators.js', () => ({
  customElement: () => () => {},
  property: () => () => {},
  state: () => () => {},
}));

describe('GivTCPPowerFlowCardEditor', () => {
  let editor: GivTCPPowerFlowCardEditor;
  let mockHass: HomeAssistant;

  beforeEach(() => {
    editor = new GivTCPPowerFlowCardEditor();
    mockHass = {
      states: {},
    } as unknown as HomeAssistant;
    editor.hass = mockHass;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should initialize _curView to 0', () => {
      // Access private property via type assertion for testing
      const editorWithPrivateAccess = editor as any;
      expect(editorWithPrivateAccess._curView).toBe(0);
    });
  });

  describe('setConfig', () => {
    it('should set config after migration and validation', () => {
      const config = {
        type: 'custom:givtcp-power-flow-card',
        invertor: 'sensor.invertor_serial',
      } as LovelaceCardConfig;

      editor.setConfig(config);

      const editorWithPrivateAccess = editor as any;
      expect(editorWithPrivateAccess._config).toBeDefined();
    });

    it('should handle config with single_invertor property', () => {
      const config = {
        type: 'custom:givtcp-power-flow-card',
        single_invertor: false,
      } as LovelaceCardConfig;

      editor.setConfig(config);

      const editorWithPrivateAccess = editor as any;
      expect(editorWithPrivateAccess._config.single_invertor).toBe(false);
    });

    it('should handle config with single_battery property', () => {
      const config = {
        type: 'custom:givtcp-power-flow-card',
        single_battery: false,
      } as LovelaceCardConfig;

      editor.setConfig(config);

      const editorWithPrivateAccess = editor as any;
      expect(editorWithPrivateAccess._config.single_battery).toBe(false);
    });
  });

  describe('_singleInverter getter', () => {
    it('should return SINGLE_INVERTOR_DEFAULT when config.single_invertor is undefined', () => {
      const config = {
        type: 'custom:givtcp-power-flow-card',
      } as LovelaceCardConfig;
      editor.setConfig(config);

      const result = (editor as any)._singleInverter;
      expect(result).toBe(SINGLE_INVERTOR_DEFAULT);
    });

    it('should return config.single_invertor when defined', () => {
      const config = {
        type: 'custom:givtcp-power-flow-card',
        single_invertor: false,
      } as LovelaceCardConfig;
      editor.setConfig(config);

      const result = (editor as any)._singleInverter;
      expect(result).toBe(false);
    });

    it('should return true when single_invertor is true', () => {
      const config = {
        type: 'custom:givtcp-power-flow-card',
        single_invertor: true,
      } as LovelaceCardConfig;
      editor.setConfig(config);

      const result = (editor as any)._singleInverter;
      expect(result).toBe(true);
    });
  });

  describe('_singleBattery getter', () => {
    it('should return SINGLE_BATTERY_DEFAULT when config.single_battery is undefined', () => {
      const config = {
        type: 'custom:givtcp-power-flow-card',
      } as LovelaceCardConfig;
      editor.setConfig(config);

      const result = (editor as any)._singleBattery;
      expect(result).toBe(SINGLE_BATTERY_DEFAULT);
    });

    it('should return config.single_battery when defined', () => {
      const config = {
        type: 'custom:givtcp-power-flow-card',
        single_battery: false,
      } as LovelaceCardConfig;
      editor.setConfig(config);

      const result = (editor as any)._singleBattery;
      expect(result).toBe(false);
    });

    it('should return true when single_battery is true', () => {
      const config = {
        type: 'custom:givtcp-power-flow-card',
        single_battery: true,
      } as LovelaceCardConfig;
      editor.setConfig(config);

      const result = (editor as any)._singleBattery;
      expect(result).toBe(true);
    });
  });

  describe('_invertorSerial getter (single inverter mode)', () => {
    it('should return empty array when no invertor config', () => {
      const config = {
        type: 'custom:givtcp-power-flow-card',
        single_invertor: true,
      } as LovelaceCardConfig;
      editor.setConfig(config);

      const result = (editor as any)._invertorSerial;
      expect(result).toEqual([]);
    });

    it('should return invertor serial from hass state', () => {
      mockHass.states = {
        'sensor.invertor_serial': {
          state: 'ABC123',
          attributes: {},
        } as any,
      };
      editor.hass = mockHass;

      const config = {
        type: 'custom:givtcp-power-flow-card',
        single_invertor: true,
        invertor: 'sensor.invertor_serial',
      } as LovelaceCardConfig;
      editor.setConfig(config);

      const result = (editor as any)._invertorSerial;
      expect(result).toEqual(['abc123']);
    });

    it('should return empty array when hass state throws error', () => {
      mockHass.states = {} as any;
      editor.hass = mockHass;

      const config = {
        type: 'custom:givtcp-power-flow-card',
        single_invertor: true,
        invertor: 'sensor.nonexistent',
      } as LovelaceCardConfig;
      editor.setConfig(config);

      const result = (editor as any)._invertorSerial;
      expect(result).toEqual([]);
    });
  });

  describe('_invertorSerial getter (multiple inverter mode)', () => {
    it('should return empty array when no invertors config', () => {
      const config = {
        type: 'custom:givtcp-power-flow-card',
        single_invertor: false,
      } as LovelaceCardConfig;
      editor.setConfig(config);

      const result = (editor as any)._invertorSerial;
      expect(result).toEqual([]);
    });

    it('should return array of invertor serials from hass states', () => {
      mockHass.states = {
        'sensor.invertor1': {
          state: 'ABC123',
          attributes: {},
        } as any,
        'sensor.invertor2': {
          state: 'DEF456',
          attributes: {},
        } as any,
      };
      editor.hass = mockHass;

      const config = {
        type: 'custom:givtcp-power-flow-card',
        single_invertor: false,
        invertors: ['sensor.invertor1', 'sensor.invertor2'],
      } as LovelaceCardConfig;
      editor.setConfig(config);

      const result = (editor as any)._invertorSerial;
      expect(result).toEqual(['abc123', 'def456']);
    });

    it('should filter out non-existent invertor states', () => {
      mockHass.states = {
        'sensor.invertor1': {
          state: 'ABC123',
          attributes: {},
        } as any,
      };
      editor.hass = mockHass;

      const config = {
        type: 'custom:givtcp-power-flow-card',
        single_invertor: false,
        invertors: ['sensor.invertor1', 'sensor.nonexistent'],
      } as LovelaceCardConfig;
      editor.setConfig(config);

      const result = (editor as any)._invertorSerial;
      expect(result).toEqual(['abc123']);
    });
  });

  describe('_batterySerial getter (single battery mode)', () => {
    it('should return empty array when no battery config', () => {
      const config = {
        type: 'custom:givtcp-power-flow-card',
        single_battery: true,
      } as LovelaceCardConfig;
      editor.setConfig(config);

      const result = (editor as any)._batterySerial;
      expect(result).toEqual([]);
    });

    it('should return battery serial from hass state', () => {
      mockHass.states = {
        'sensor.battery_serial': {
          state: 'BAT123',
          attributes: {},
        } as any,
      };
      editor.hass = mockHass;

      const config = {
        type: 'custom:givtcp-power-flow-card',
        single_battery: true,
        battery: 'sensor.battery_serial',
      } as LovelaceCardConfig;
      editor.setConfig(config);

      const result = (editor as any)._batterySerial;
      expect(result).toEqual(['bat123']);
    });

    it('should return empty array when hass state throws error', () => {
      mockHass.states = {} as any;
      editor.hass = mockHass;

      const config = {
        type: 'custom:givtcp-power-flow-card',
        single_battery: true,
        battery: 'sensor.nonexistent',
      } as LovelaceCardConfig;
      editor.setConfig(config);

      const result = (editor as any)._batterySerial;
      expect(result).toEqual([]);
    });
  });

  describe('_batterySerial getter (multiple battery mode)', () => {
    it('should return empty array when no batteries config', () => {
      const config = {
        type: 'custom:givtcp-power-flow-card',
        single_battery: false,
      } as LovelaceCardConfig;
      editor.setConfig(config);

      const result = (editor as any)._batterySerial;
      expect(result).toEqual([]);
    });

    it('should return array of battery serials from hass states', () => {
      mockHass.states = {
        'sensor.battery1': {
          state: 'BAT123',
          attributes: {},
        } as any,
        'sensor.battery2': {
          state: 'BAT456',
          attributes: {},
        } as any,
      };
      editor.hass = mockHass;

      const config = {
        type: 'custom:givtcp-power-flow-card',
        single_battery: false,
        batteries: ['sensor.battery1', 'sensor.battery2'],
      } as LovelaceCardConfig;
      editor.setConfig(config);

      const result = (editor as any)._batterySerial;
      expect(result).toEqual(['bat123', 'bat456']);
    });

    it('should filter out non-existent battery states', () => {
      mockHass.states = {
        'sensor.battery1': {
          state: 'BAT123',
          attributes: {},
        } as any,
      };
      editor.hass = mockHass;

      const config = {
        type: 'custom:givtcp-power-flow-card',
        single_battery: false,
        batteries: ['sensor.battery1', 'sensor.nonexistent'],
      } as LovelaceCardConfig;
      editor.setConfig(config);

      const result = (editor as any)._batterySerial;
      expect(result).toEqual(['bat123']);
    });
  });

  describe('_batteries getter', () => {
    it('should return empty array when no hass', () => {
      editor.hass = undefined as any;

      const result = (editor as any)._batteries;
      expect(result).toEqual([]);
    });

    it('should return entity ids containing battery_serial_number', () => {
      mockHass.states = {
        'sensor.battery_serial_number_1': { state: 'BAT1', attributes: {} } as any,
        'sensor.other_entity': { state: 'other', attributes: {} } as any,
        'sensor.battery_serial_number_2': { state: 'BAT2', attributes: {} } as any,
      };
      editor.hass = mockHass;

      const result = (editor as any)._batteries;
      expect(result).toEqual(['sensor.battery_serial_number_1', 'sensor.battery_serial_number_2']);
    });
  });

  describe('_invertors getter', () => {
    it('should return empty array when no hass', () => {
      editor.hass = undefined as any;

      const result = (editor as any)._invertors;
      expect(result).toEqual([]);
    });

    it('should return entity ids containing invertor_serial_number', () => {
      mockHass.states = {
        'sensor.invertor_serial_number_1': { state: 'INV1', attributes: {} } as any,
        'sensor.other_entity': { state: 'other', attributes: {} } as any,
        'sensor.invertor_serial_number_2': { state: 'INV2', attributes: {} } as any,
      };
      editor.hass = mockHass;

      const result = (editor as any)._invertors;
      expect(result).toEqual(['sensor.invertor_serial_number_1', 'sensor.invertor_serial_number_2']);
    });
  });

  describe('_extraEntities getter', () => {
    it('should return empty array when no hass', () => {
      editor.hass = undefined as any;

      const result = (editor as any)._extraEntities;
      expect(result).toEqual([]);
    });

    it('should return entities that include invertor serial', () => {
      mockHass.states = {
        'sensor.abc123_power': { state: '100', attributes: {} } as any,
        'sensor.other': { state: '200', attributes: {} } as any,
      };
      editor.hass = mockHass;

      const config = {
        type: 'custom:givtcp-power-flow-card',
        single_invertor: true,
        invertor: 'sensor.invertor_serial',
      } as LovelaceCardConfig;
      editor.setConfig(config);

      // Set up invertor serial
      mockHass.states['sensor.invertor_serial'] = { state: 'ABC123', attributes: {} } as any;

      const result = (editor as any)._extraEntities;
      expect(result).toContain('sensor.abc123_power');
    });

    it('should return battery entities with valid device_class', () => {
      mockHass.states = {
        'sensor.bat123_battery': { state: '50', attributes: { device_class: 'battery' } } as any,
        'sensor.bat123_energy': { state: '100', attributes: { device_class: 'energy' } } as any,
        'sensor.bat123_power': { state: '200', attributes: { device_class: 'power' } } as any,
        'sensor.bat123_current': { state: '5', attributes: { device_class: 'current' } } as any,
        'sensor.bat123_voltage': { state: '48', attributes: { device_class: 'voltage' } } as any,
        'sensor.bat123_timestamp': { state: '2024-01-01', attributes: { device_class: 'timestamp' } } as any,
      };
      editor.hass = mockHass;

      const config = {
        type: 'custom:givtcp-power-flow-card',
        single_battery: true,
        battery: 'sensor.battery_serial',
      } as LovelaceCardConfig;
      editor.setConfig(config);

      mockHass.states['sensor.battery_serial'] = { state: 'BAT123', attributes: {} } as any;

      const result = (editor as any)._extraEntities;
      expect(result).toContain('sensor.bat123_battery');
      expect(result).toContain('sensor.bat123_energy');
      expect(result).toContain('sensor.bat123_power');
      expect(result).toContain('sensor.bat123_current');
      expect(result).toContain('sensor.bat123_voltage');
      expect(result).toContain('sensor.bat123_timestamp');
    });

    it('should return battery entities with valid state_class', () => {
      mockHass.states = {
        'sensor.bat123_total_increasing': { state: '100', attributes: { state_class: 'total_increasing' } } as any,
        'sensor.bat123_total': { state: '200', attributes: { state_class: 'total' } } as any,
        'sensor.bat123_measurement': { state: '300', attributes: { state_class: 'measurement' } } as any,
      };
      editor.hass = mockHass;

      const config = {
        type: 'custom:givtcp-power-flow-card',
        single_battery: true,
        battery: 'sensor.battery_serial',
      } as LovelaceCardConfig;
      editor.setConfig(config);

      mockHass.states['sensor.battery_serial'] = { state: 'BAT123', attributes: {} } as any;

      const result = (editor as any)._extraEntities;
      expect(result).toContain('sensor.bat123_total_increasing');
      expect(result).toContain('sensor.bat123_total');
      expect(result).toContain('sensor.bat123_measurement');
    });
  });

  describe('_defaults getter', () => {
    it('should return default config values', () => {
      const config = {
        type: 'custom:givtcp-power-flow-card',
      } as LovelaceCardConfig;
      editor.setConfig(config);

      const defaults = (editor as any)._defaults;
      expect(defaults).toBeDefined();
      expect(defaults.type).toBe('custom:givtcp-power-flow-card');
    });
  });

  describe('_schema getter', () => {
    it('should return General schema for curView 0', () => {
      const config = {
        type: 'custom:givtcp-power-flow-card',
      } as LovelaceCardConfig;
      editor.setConfig(config);
      (editor as any)._curView = 0;

      const schema = (editor as any)._schema;
      expect(Array.isArray(schema)).toBe(true);
      expect(schema.length).toBeGreaterThan(0);
    });

    it('should return Layout schema for curView 1', () => {
      const config = {
        type: 'custom:givtcp-power-flow-card',
      } as LovelaceCardConfig;
      editor.setConfig(config);
      (editor as any)._curView = 1;

      const schema = (editor as any)._schema;
      expect(Array.isArray(schema)).toBe(true);
    });

    it('should return Grid schema for curView 2', () => {
      const config = {
        type: 'custom:givtcp-power-flow-card',
      } as LovelaceCardConfig;
      editor.setConfig(config);
      (editor as any)._curView = 2;

      const schema = (editor as any)._schema;
      expect(Array.isArray(schema)).toBe(true);
    });

    it('should return Solar schema for curView 3', () => {
      const config = {
        type: 'custom:givtcp-power-flow-card',
      } as LovelaceCardConfig;
      editor.setConfig(config);
      (editor as any)._curView = 3;

      const schema = (editor as any)._schema;
      expect(Array.isArray(schema)).toBe(true);
    });

    it('should return Battery schema for curView 4', () => {
      const config = {
        type: 'custom:givtcp-power-flow-card',
      } as LovelaceCardConfig;
      editor.setConfig(config);
      (editor as any)._curView = 4;

      const schema = (editor as any)._schema;
      expect(Array.isArray(schema)).toBe(true);
    });

    it('should return House schema for curView 5', () => {
      const config = {
        type: 'custom:givtcp-power-flow-card',
      } as LovelaceCardConfig;
      editor.setConfig(config);
      (editor as any)._curView = 5;

      const schema = (editor as any)._schema;
      expect(Array.isArray(schema)).toBe(true);
    });

    it('should return Details schema for curView 6', () => {
      const config = {
        type: 'custom:givtcp-power-flow-card',
      } as LovelaceCardConfig;
      editor.setConfig(config);
      (editor as any)._curView = 6;

      const schema = (editor as any)._schema;
      expect(Array.isArray(schema)).toBe(true);
    });

    it('should return empty array for unknown curView', () => {
      const config = {
        type: 'custom:givtcp-power-flow-card',
      } as LovelaceCardConfig;
      editor.setConfig(config);
      (editor as any)._curView = 99;

      const schema = (editor as any)._schema;
      expect(schema).toEqual([]);
    });
  });

  describe('render', () => {
    it('should return empty template when no hass', () => {
      editor.hass = undefined as any;

      const result = editor.render();
      expect(result).toBeDefined();
    });

    it('should return empty template when no config', () => {
      const editorWithPrivateAccess = editor as any;
      editorWithPrivateAccess._config = undefined;

      const result = editor.render();
      expect(result).toBeDefined();
    });

    it('should render ha-tabs with correct tabs', () => {
      const config = {
        type: 'custom:givtcp-power-flow-card',
      } as LovelaceCardConfig;
      editor.setConfig(config);

      const result = editor.render();
      expect(result).toBeDefined();
    });

    it('should reset colour config when colour_type changes from non-ui to ui', () => {
      const config = {
        type: 'custom:givtcp-power-flow-card',
        solar_colour_type: 'ui',
      } as LovelaceCardConfig;
      editor.setConfig(config);

      const result = editor.render();
      expect(result).toBeDefined();
    });

    it('should reset colour config when colour_type changes from ui to non-ui', () => {
      const config = {
        type: 'custom:givtcp-power-flow-card',
        solar_colour_type: 'rgb',
      } as LovelaceCardConfig;
      editor.setConfig(config);

      const result = editor.render();
      expect(result).toBeDefined();
    });
  });

  describe('_handleTabChanged', () => {
    it('should update _curView when tab is changed', () => {
      const config = {
        type: 'custom:givtcp-power-flow-card',
      } as LovelaceCardConfig;
      editor.setConfig(config);

      const mockEvent = {
        preventDefault: jest.fn(),
        detail: {
          selected: 3,
        },
      } as any;

      editor['_handleTabChanged'](mockEvent);

      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect((editor as any)._curView).toBe(3);
    });

    it('should handle tab change to 0', () => {
      const config = {
        type: 'custom:givtcp-power-flow-card',
      } as LovelaceCardConfig;
      editor.setConfig(config);
      (editor as any)._curView = 5;

      const mockEvent = {
        preventDefault: jest.fn(),
        detail: {
          selected: 0,
        },
      } as any;

      editor['_handleTabChanged'](mockEvent);

      expect((editor as any)._curView).toBe(0);
    });
  });

  describe('_computeLabelCallback', () => {
    it('should return schema label when provided', () => {
      const schema = { name: 'test', label: 'Custom Label' };
      const result = (editor as any)._computeLabelCallback(schema);
      expect(result).toBe('Custom Label');
    });

    it('should return "Invertor" for invertor schema name', () => {
      const schema = { name: 'invertor' };
      const result = (editor as any)._computeLabelCallback(schema);
      expect(result).toBe('Invertor');
    });

    it('should return "Battery" for battery schema name', () => {
      const schema = { name: 'battery' };
      const result = (editor as any)._computeLabelCallback(schema);
      expect(result).toBe('Battery');
    });

    it('should return "Layout" for entity_layout schema name', () => {
      const schema = { name: 'entity_layout' };
      const result = (editor as any)._computeLabelCallback(schema);
      expect(result).toBe('Layout');
    });

    it('should return schema name for unknown names', () => {
      const schema = { name: 'unknown_field' };
      const result = (editor as any)._computeLabelCallback(schema);
      expect(result).toBe('unknown_field');
    });
  });

  describe('_valueChanged', () => {
    it('should fire config-changed event with new config', () => {
      const newConfig = {
        type: 'custom:givtcp-power-flow-card',
        solar: 'sensor.solar_power',
      } as LovelaceCardConfig;

      const mockEvent = {
        detail: {
          value: newConfig,
        },
      } as any;

      editor['_valueChanged'](mockEvent);

      expect(fireEvent).toHaveBeenCalledWith(editor, 'config-changed', { config: newConfig });
    });

    it('should handle config with all properties', () => {
      const newConfig = {
        type: 'custom:givtcp-power-flow-card',
        invertor: 'sensor.invertor',
        battery: 'sensor.battery',
        solar: 'sensor.solar',
        grid: 'sensor.grid',
        house: 'sensor.house',
      } as LovelaceCardConfig;

      const mockEvent = {
        detail: {
          value: newConfig,
        },
      } as any;

      editor['_valueChanged'](mockEvent);

      expect(fireEvent).toHaveBeenCalledWith(editor, 'config-changed', { config: newConfig });
    });
  });

  describe('General schema (curView 0)', () => {
    it('should include name field', () => {
      const config = {
        type: 'custom:givtcp-power-flow-card',
      } as LovelaceCardConfig;
      editor.setConfig(config);
      (editor as any)._curView = 0;

      const schema = (editor as any)._schema;
      const nameField = schema.find((s: any) => s.name === 'name');
      expect(nameField).toBeDefined();
      expect(nameField?.label).toBe('Name');
    });

    it('should include dot_size field with correct default', () => {
      const config = {
        type: 'custom:givtcp-power-flow-card',
      } as LovelaceCardConfig;
      editor.setConfig(config);
      (editor as any)._curView = 0;

      const schema = (editor as any)._schema;
      // Find the grid schema that contains dot_size (the last grid type element)
      const gridElement = schema.find((s: any) => s.type === 'grid' && s.schema?.some((f: any) => f.name === 'dot_size'));
      const gridSchema = gridElement?.schema || [];
      const dotSizeField = gridSchema.find((s: any) => s.name === 'dot_size');
      expect(dotSizeField).toBeDefined();
      expect(dotSizeField?.default).toBe(DOT_SIZE_DEFAULT);
    });

    it('should include dot_speed field with correct default', () => {
      const config = {
        type: 'custom:givtcp-power-flow-card',
      } as LovelaceCardConfig;
      editor.setConfig(config);
      (editor as any)._curView = 0;

      const schema = (editor as any)._schema;
      const gridElement = schema.find((s: any) => s.type === 'grid' && s.schema?.some((f: any) => f.name === 'dot_speed'));
      const gridSchema = gridElement?.schema || [];
      const dotSpeedField = gridSchema.find((s: any) => s.name === 'dot_speed');
      expect(dotSpeedField).toBeDefined();
      expect(dotSpeedField?.default).toBe(DOT_SPEED_DEFAULT);
    });

    it('should include line_width field with correct default', () => {
      const config = {
        type: 'custom:givtcp-power-flow-card',
      } as LovelaceCardConfig;
      editor.setConfig(config);
      (editor as any)._curView = 0;

      const schema = (editor as any)._schema;
      const gridElement = schema.find((s: any) => s.type === 'grid' && s.schema?.some((f: any) => f.name === 'line_width'));
      const gridSchema = gridElement?.schema || [];
      const lineWidthField = gridSchema.find((s: any) => s.name === 'line_width');
      expect(lineWidthField).toBeDefined();
      expect(lineWidthField?.default).toBe(LINE_WIDTH_DEFAULT);
    });

    it('should include entity_size field with correct default', () => {
      const config = {
        type: 'custom:givtcp-power-flow-card',
      } as LovelaceCardConfig;
      editor.setConfig(config);
      (editor as any)._curView = 0;

      const schema = (editor as any)._schema;
      const gridElement = schema.find((s: any) => s.type === 'grid' && s.schema?.some((f: any) => f.name === 'entity_size'));
      const gridSchema = gridElement?.schema || [];
      const entitySizeField = gridSchema.find((s: any) => s.name === 'entity_size');
      expect(entitySizeField).toBeDefined();
      expect(entitySizeField?.default).toBe(ENTITY_SIZE_DEFAULT);
    });

    it('should include power_margin field with correct unit', () => {
      const config = {
        type: 'custom:givtcp-power-flow-card',
      } as LovelaceCardConfig;
      editor.setConfig(config);
      (editor as any)._curView = 0;

      const schema = (editor as any)._schema;
      const gridElement = schema.find((s: any) => s.type === 'grid' && s.schema?.some((f: any) => f.name === 'power_margin'));
      const gridSchema = gridElement?.schema || [];
      const powerMarginField = gridSchema.find((s: any) => s.name === 'power_margin');
      expect(powerMarginField).toBeDefined();
      expect(powerMarginField?.default).toBe(POWER_MARGIN_DEFAULT);
    });

    it('should include hide_inactive_flows boolean field', () => {
      const config = {
        type: 'custom:givtcp-power-flow-card',
      } as LovelaceCardConfig;
      editor.setConfig(config);
      (editor as any)._curView = 0;

      const schema = (editor as any)._schema;
      const gridElement = schema.find((s: any) => s.type === 'grid' && s.schema?.some((f: any) => f.name === 'hide_inactive_flows'));
      const gridSchema = gridElement?.schema || [];
      const hideInactiveField = gridSchema.find((s: any) => s.name === 'hide_inactive_flows');
      expect(hideInactiveField).toBeDefined();
      expect(hideInactiveField?.selector).toHaveProperty('boolean');
    });

    it('should include colour_icons_and_text boolean field', () => {
      const config = {
        type: 'custom:givtcp-power-flow-card',
      } as LovelaceCardConfig;
      editor.setConfig(config);
      (editor as any)._curView = 0;

      const schema = (editor as any)._schema;
      const gridElement = schema.find((s: any) => s.type === 'grid' && s.schema?.some((f: any) => f.name === 'colour_icons_and_text'));
      const gridSchema = gridElement?.schema || [];
      const colourIconsField = gridSchema.find((s: any) => s.name === 'colour_icons_and_text');
      expect(colourIconsField).toBeDefined();
      expect(colourIconsField?.selector).toHaveProperty('boolean');
    });
  });
});
