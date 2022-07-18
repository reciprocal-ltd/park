// import {
//     Col, Label,
//     ManagedRadioButtonField as Radio, Row, Text
//   } from '@tlon/indigo-react';
//   import React, { ReactElement } from 'react';
//   import { ColorInput } from './ColorInput';
//   import { ImageInput } from './ImageInput';
  
//   export type BgType = 'none' | 'url' | 'color';
  
//   export function BackgroundPicker(): ReactElement {
//     const rowSpace = { my: 0, alignItems: 'center' };
//     const colProps = {
//       my: 3,
//       mr: 4,
//       gapY: 1,
//       minWidth: '266px',
//       width: ['100%', '288px']
//     };
//     return (
//       <div className="flex flex-col">
//         <h3>Background</h3>
//         <div className="flex flex-wrap">
//           <div className="flex flex-col my-3 mr-4 space-y-1 min-w-20">
//             <input type="radio" className="mb-1 inline" name="bgType" label="Image" id="url" />
//             <span className="ml-5 text-gray-400">Set an image background</span>
//             <ImageInput
//               ml={5}
//               id="bgUrl"
//               placeholder="Drop or upload a file, or paste an image URL here"
//               name="bgUrl"
//             />
//           </div>
//         </div>
//         <div className="flex" {...rowSpace}>
//           <div className="flex flex-col" {...colProps}>
//             <Radio mb={1} label="Color" id="color" name="bgType" />
//             <span ml={5} gray>Set a hex-based background</span>
//             <ColorInput placeholder="FFFFFF" ml={5} id="bgColor" />
//           </div>
//         </div>
//         <Radio
//           my={3}
//           caption="Your home screen will simply render as its respective day/night mode color"
//           name="bgType"
//           label="None"
//           id="none"
//         />
//       </div>
//     );
//   }

export {}