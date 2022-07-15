import classNames from 'classnames';
import React, {
  ChangeEvent,
  FocusEvent,
  FormEvent,
  KeyboardEvent,
  HTMLAttributes,
  useCallback,
  useImperativeHandle,
  useRef,
  useEffect
} from 'react';
import { Link, useHistory, useRouteMatch } from 'react-router-dom';
import { Cross } from '../components/icons/Cross';
import { useDebounce } from '../logic/useDebounce';
import { useErrorHandler } from '../logic/useErrorHandler';
import { MenuState, useLeapStore } from './Nav';

function normalizePathEnding(path: string) {
  const end = path.length - 1;
  return path[end] === '/' ? path.substring(0, end - 1) : path;
}

export function createPreviousPath(current: string): string {
  const parts = normalizePathEnding(current).split('/');
  parts.pop();

  if (parts[parts.length - 1] === 'leap') {
    parts.push('search');
  }

  return parts.join('/');
}

type LeapProps = {
  menu: MenuState;
  dropdown: string;
  navOpen: boolean;
  shouldDim: boolean;
} & HTMLAttributes<HTMLDivElement>;

function normalizeMatchString(match: string, keepAltChars: boolean): string {
  let normalizedString = match.toLocaleLowerCase().trim();

  if (!keepAltChars) {
    normalizedString = normalizedString.replace(/[^\w]/, '');
  }

  return normalizedString;
}

export const Leap = React.forwardRef(
  ({ menu, dropdown, navOpen, shouldDim, className }: LeapProps, ref) => {
    const { push } = useHistory();
    const match = useRouteMatch<{ menu?: MenuState; query?: string; desk?: string }>(
      `/leap/${menu}/:query?/(apps)?/:desk?`
    );
    const appsMatch = useRouteMatch(`/leap/${menu}/${match?.params.query}/apps`);
    const inputRef = useRef<HTMLInputElement>(null);
    useImperativeHandle(ref, () => inputRef.current);
    const { rawInput, selectedMatch, matches, selection, select } = useLeapStore();
    const handleError = useErrorHandler();

    useEffect(() => {
      const onTreaty = appsMatch && !appsMatch.isExact;
      if (selection && rawInput === '' && !onTreaty) {
        inputRef.current?.focus();
      } else if (selection && onTreaty) {
        inputRef.current?.blur();
      }
    }, [selection, rawInput, appsMatch]);

    useEffect(() => {
      const newMatch = getMatch(rawInput);
      if (newMatch && rawInput) {
        useLeapStore.setState({ selectedMatch: newMatch });
      }
    }, [rawInput, matches]);

    const toggleSearch = useCallback(() => {
      if (selection || menu === 'search') {
        return;
      }

      push('/leap/search');
    }, [selection, menu]);

    const onFocus = useCallback(
      (e: FocusEvent<HTMLInputElement>) => {
        // refocusing tab with input focused is false trigger
        const windowFocus = e.nativeEvent.currentTarget === document.body;
        if (windowFocus) {
          return;
        }

        toggleSearch();
      },
      [toggleSearch]
    );

    const getMatch = useCallback(
      (value: string) => {
        const onlySymbols = !value.match(/[\w]/g);
        const normValue = normalizeMatchString(value, onlySymbols);
        return matches.find((m) =>
          normalizeMatchString(m.value, onlySymbols).startsWith(normValue)
        );
      },
      [matches]
    );

    const navigateByInput = useCallback(
      (input: string) => {
        const normalizedValue = input
          .trim()
          .replace('%', '')
          .replace(/(~?[\w^_-]{3,13})\//, '$1/apps/$1/');
        push(`/leap/${menu}/${normalizedValue}`);
      },
      [menu]
    );

    const debouncedSearch = useDebounce(
      (input: string) => {
        if (!match || appsMatch) {
          return;
        }

        useLeapStore.setState({ searchInput: input });
        navigateByInput(input);
      },
      300,
      { leading: true }
    );

    const handleSearch = useCallback(debouncedSearch, [match]);

    const onChange = useCallback(
      handleError((e: ChangeEvent<HTMLInputElement>) => {
        const input = e.target as HTMLInputElement;
        const value = input.value.trim();
        const isDeletion = (e.nativeEvent as InputEvent).inputType === 'deleteContentBackward';
        const inputMatch = getMatch(value);
        const matchValue = inputMatch?.value;

        if (matchValue && inputRef.current && !isDeletion) {
          inputRef.current.value = matchValue;
          const start = matchValue.startsWith(value)
            ? value.length
            : matchValue.substring(0, matchValue.indexOf(value)).length + value.length;
          inputRef.current.setSelectionRange(start, matchValue.length);
          useLeapStore.setState({
            rawInput: matchValue,
            selectedMatch: inputMatch
          });
        } else {
          useLeapStore.setState({
            rawInput: value,
            selectedMatch: matches[0]
          });
        }

        handleSearch(value);
      }),
      [matches]
    );

    const onSubmit = useCallback(
      handleError((e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const value = inputRef.current?.value.trim();
        const currentMatch = selectedMatch || (value && getMatch(value));

        if (!currentMatch) {
          return;
        }

        if (currentMatch?.openInNewTab) {
          window.open(currentMatch.url, currentMatch.value);
          return;
        }

        push(currentMatch.url);
        useLeapStore.setState({ rawInput: '' });
      }),
      [match, selectedMatch]
    );

    const onKeyDown = useCallback(
      handleError((e: KeyboardEvent<HTMLDivElement>) => {
        const deletion = e.key === 'Backspace' || e.key === 'Delete';
        const arrow = e.key === 'ArrowDown' || e.key === 'ArrowUp';

        if (deletion && !rawInput && selection) {
          e.preventDefault();
          select(null, appsMatch && !appsMatch.isExact ? undefined : match?.params.query);
          const pathBack = createPreviousPath(match?.url || '');
          push(pathBack);
        }

        if (arrow) {
          e.preventDefault();
          if (matches.length === 0) {
            return;
          }

          const currentIndex = selectedMatch
            ? matches.findIndex((m) => {
                const matchValue = m.value;
                const searchValue = selectedMatch.value;
                return matchValue === searchValue;
              })
            : 0;
          const unsafeIndex = e.key === 'ArrowUp' ? currentIndex - 1 : currentIndex + 1;
          const index = (unsafeIndex + matches.length) % matches.length;

          const newMatch = matches[index];
          useLeapStore.setState({
            rawInput: newMatch.value,
            // searchInput: matchValue,
            selectedMatch: newMatch
          });
        }
      }),
      [selection, rawInput, match, matches, selectedMatch]
    );

    return (
      <div className="relative z-50 w-full">
        <form
          className={classNames(
            'flex items-center h-full w-full px-2 rounded-full bg-white default-ring focus-within:ring-2',
            shouldDim && 'opacity-60',
            !navOpen ? 'bg-gray-50' : '',
            menu === 'upgrading' ? 'bg-orange-500' : '',
            className
          )}
          onSubmit={onSubmit}
        >
          <label
            htmlFor="leap"
            className={classNames(
              'inline-block flex-none p-2 h4 ',
              menu === 'upgrading' ? 'text-white' : !selection ? 'sr-only' : 'text-blue-400'
            )}
          >
            {menu === 'upgrading'
              ? 'Your Urbit is being updated, this page will update when ready'
              : selection || 'Search'}
          </label>
          {menu !== 'upgrading' ? (
            <input
              id="leap"
              type="text"
              ref={inputRef}
              placeholder={selection ? '' : 'Search'}
              className="flex-1 w-full h-full px-2 text-base bg-transparent rounded-full outline-none h4"
              value={rawInput}
              onClick={toggleSearch}
              onFocus={onFocus}
              onChange={onChange}
              onKeyDown={onKeyDown}
              autoComplete="off"
              aria-autocomplete="both"
              aria-controls={dropdown}
              aria-activedescendant={selectedMatch?.value}
            />
          ) : null}
        </form>
        {menu === 'search' && (
          <Link
            to="/"
            className="absolute flex-none w-8 h-8 text-gray-400 top-1/2 right-2 circle-button bg-gray-50 default-ring -translate-y-1/2"
            onClick={() => select(null)}
          >
            <Cross className="w-3 h-3 fill-current" />
            <span className="sr-only">Close</span>
          </Link>
        )}
      </div>
    );
  }
);
