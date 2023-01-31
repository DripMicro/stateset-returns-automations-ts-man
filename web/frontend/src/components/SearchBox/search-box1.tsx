import { Autocomplete, Icon } from '@shopify/polaris';
import { SearchMinor } from '@shopify/polaris-icons';
import { useState, useCallback, useMemo } from 'react';
import algoliasearch from 'algoliasearch';
import { Strong } from 'evergreen-ui';

interface IOption {
    value: string;
    label: string;
}

const searchClient = algoliasearch(
    '33E3DVTXWA',
    '2fc6ed599dba85c5f91d61afe6737e7e'
);

const index = searchClient.initIndex('prod_RMAI_returns');

export function SearchBox() {
    const deselectedOptions: any[] = useMemo(() => [], []);
    const [selectedOptions, setSelectedOptions] = useState<any[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [options, setOptions] = useState(deselectedOptions);

    const updateText = useCallback((value: string) => {
        setInputValue(value);
        index.search(value).then(({ hits }) => {
            // console.log(hits);
            setOptions(
                hits.map((hit: any) => {
                    return (
                        <>
                            RMA: <Strong>{hit.rma}</Strong>&nbsp; &nbsp; Object
                            ID: <Strong>{hit.objectID}</Strong>
                        </>
                    );
                })
            );
        });
    }, []);

    const updateSelection = useCallback(
        (selected: any[]) => {
            const selectedValue = selected.map((selectedItem) => {
                const matchedOption = options.find((option) => {
                    return option.value.match(selectedItem);
                });
                return matchedOption && matchedOption.label;
            });

            setSelectedOptions(selected);
            setInputValue(selectedValue[0] as string);
        },
        [options]
    );

    const textField = (
        <Autocomplete.TextField
            onChange={updateText}
            value={inputValue}
            labelHidden
            label="search"
            prefix={<Icon source={SearchMinor} color="base" />}
            placeholder="Search"
            autoComplete=""
        />
    );

    return (
        <div>
            <Autocomplete
                options={options}
                selected={selectedOptions}
                onSelect={updateSelection}
                textField={textField}
            />
        </div>
    );
}
