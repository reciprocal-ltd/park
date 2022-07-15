import React, { FunctionComponent, useEffect } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { Route, useHistory, useParams } from 'react-router-dom';
import { ErrorAlert } from '../components/ErrorAlert';
import { MenuState, Nav } from '../nav/Nav';
import useKilnState from '../state/kiln';
import { useSettingsState } from '../state/settings';
import { RemoveApp } from '../tiles/RemoveApp';
import { SuspendApp } from '../tiles/SuspendApp';
import { TileGrid } from '../tiles/TileGrid';
import { uxToHex } from '@urbit/api';
import { TileInfo } from '../tiles/TileInfo';

interface RouteProps {
  menu?: MenuState;
}

export const Grid: FunctionComponent = () => {
  const { push } = useHistory();
  const { menu } = useParams<RouteProps>();
  const { display } = useSettingsState();
  console.log(useSettingsState())

  useEffect(() => {
    // TOOD: rework
    // Heuristically detect reload completion and redirect
    async function attempt(count = 0) {
      if (count > 5) {
        window.location.reload();
      }
      const start = performance.now();
      await useKilnState.getState().fetchVats();
      await useKilnState.getState().fetchVats();
      if (performance.now() - start > 5000) {
        attempt(count + 1);
      } else {
        push('/');
      }
    }
    if (menu === 'upgrading') {
      attempt();
    }
  }, [menu]);

  let theme = {
    background: 'none',
    backgroundSize: ''
  };

  if (display?.backgroundType === 'color') {
    theme.background = `#${uxToHex(display?.background || '0x0')}`
  }
  if (display?.backgroundType === 'url') {
    theme.background = `url("${display?.background}")`
    theme.backgroundSize = 'cover';
  }

  return (
    <div className="w-screen h-screen z-20" style={theme}>
    <div className="flex flex-col">
      <header className="fixed sm:sticky bottom-0 sm:bottom-auto sm:top-0 left-0 z-30 flex justify-center w-full px-4">
        <Nav menu={menu} />
      </header>

      <main className="h-full w-full flex justify-center pt-4 md:pt-16 pb-32 relative z-0">
        <TileGrid menu={menu} />
        <ErrorBoundary FallbackComponent={ErrorAlert} onReset={() => push('/')}>
          <Route exact path="/app/:desk">
            <TileInfo />
          </Route>
          <Route exact path="/app/:desk/suspend">
            <SuspendApp />
          </Route>
          <Route exact path="/app/:desk/remove">
            <RemoveApp />
          </Route>
        </ErrorBoundary>
      </main>
    </div>
    </div>
  );
};
