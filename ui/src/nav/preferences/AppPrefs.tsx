import React, { useCallback } from 'react';
import {
  Col,
  Label,
  ManagedRadioButtonField as Radio,
  Text
} from '@tlon/indigo-react';
import { RouteComponentProps } from 'react-router-dom';
import { Setting } from '../../components/Setting';
import { ShipName } from '../../components/ShipName';
import { useCharge } from '../../state/docket';
import useKilnState, { useVat } from '../../state/kiln';
import { getAppName } from '../../state/util';
import { useSettingsState, SettingsState } from '../../state/settings';
import { BackgroundPicker, BgType } from './BackgroundPicker';
import shallow from 'zustand/shallow';
import { FormikOnBlur } from '../../components/FormikOnBlur';
import { Form } from 'formik';
import * as Yup from 'yup';


interface FormSchema {
  bgType: BgType;
  bgColor: string | undefined;
  bgUrl: string | undefined;
  theme: string;
}
const emptyString = '';

const formSchema = Yup.object().shape({
  bgType: Yup.string()
    .oneOf(['none', 'color', 'url'], 'invalid')
    .required('Required'),
  bgColor: Yup.string().when('bgType', (bgType, schema) => bgType === 'color' ? schema.required() : schema),
  bgUrl: Yup.string().when('bgType', (bgType, schema) => bgType === 'url' ? schema.required() : schema),
  theme: Yup.string().oneOf(['light', 'dark', 'auto']).required('Required')
});

const settingsSel = (s: SettingsState): FormSchema => {
  const { display } = s;
  let bgColor = emptyString;
  let bgUrl = emptyString;
  if (display.backgroundType === 'url') {
    bgUrl = display.background;
  }
  if (display.backgroundType === 'color') {
    bgColor = display.background;
  }
  return {
    bgType: display.backgroundType,
    bgColor,
    bgUrl,
    theme: display.theme
  };
};

const ParkPrefs = () => {
  const initialValues = useSettingsState(settingsSel, shallow);
  console.log(useSettingsState().display)

  const onSubmit = useCallback(async (values) => {
    const { putEntry } = useSettingsState.getState();
    const { bgType, bgColor, bgUrl, theme } = initialValues;

    if (bgType !== values.bgType) {
      putEntry('display', 'backgroundType', values.bgType);
    }

    if (bgColor !== values.bgColor || bgUrl !== values.bgUrl) {
      putEntry(
        'display',
        'background',
        values.bgType === 'color'
          ? values.bgColor
          : values.bgType === 'url'
          ? values.bgUrl || ''
          : ''
      );
    }

    if (theme !== values.theme) {
      putEntry('display', 'theme', values.theme);
    }
  }, [initialValues]);

  return (
    <FormikOnBlur
      validationSchema={formSchema}
      initialValues={initialValues}
      onSubmit={onSubmit}
    >
      <Form>
        <div className="flex flex-col space-y-5">
          <BackgroundPicker />
          <Label>Theme</Label>
          <Radio name="theme" id="light" label="Light" />
          <Radio name="theme" id="dark" label="Dark" />
          <Radio name="theme" id="auto" label="Auto" />
        </div>
      </Form>
    </FormikOnBlur>
   )
}

export const AppPrefs = ({ match }: RouteComponentProps<{ desk: string }>) => {
  const { desk } = match.params;
  const charge = useCharge(desk);
  const vat = useVat(desk);
  const tracking = !!vat?.arak.rail;
  const otasEnabled = !vat?.arak.rail?.paused;
  const otaSource = vat?.arak.rail?.ship;
  const toggleOTAs = useKilnState((s) => s.toggleOTAs);

  const toggleUpdates = useCallback((on: boolean) => toggleOTAs(desk, on), [desk, toggleOTAs]);

  return (
    <>
      <h2 className="h3 mb-7">{getAppName(charge)} Settings</h2>
      <div className="space-y-3">
        {tracking ? (
          <Setting on={otasEnabled} toggle={toggleUpdates} name="Automatic Updates">
            <p>Automatically download and apply updates to keep {getAppName(charge)} up to date.</p>
            {otaSource && (
              <p>
                OTA Source: <ShipName name={otaSource} className="font-semibold font-mono" />
              </p>
            )}
          </Setting>
        ) : (null
        )}
        { desk === 'garden' }
      </div>
    </>
  );
};
