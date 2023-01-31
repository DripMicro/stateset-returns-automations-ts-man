import React from 'react';
import algoliasearch from 'algoliasearch';
import { Heading, Link, SearchInput, Strong } from 'evergreen-ui';
import {
    connectHits,
    connectSearchBox,
    connectStateResults,
    Configure,
    Index,
    InstantSearch
} from 'react-instantsearch-dom';

const searchClient = algoliasearch(
    '33E3DVTXWA',
    '2fc6ed599dba85c5f91d61afe6737e7e'
);

const ReturnHits = ({ hits }: { hits: any[] }) => (
    <ul className="searchItems">
        {hits.map((hit: any) => (
            <Link href={`/return/${hit.objectID}`}>
                <li key={hit.objectID}>
                    <Heading>
                        RMA: <Strong>{hit.rma}</Strong> &nbsp; &nbsp; Object ID:{' '}
                        <Strong>{hit.objectID}</Strong> &nbsp; &nbsp; Tracking
                        Number: <Strong>{hit.tracking_number}</Strong>
                    </Heading>
                </li>
            </Link>
        ))}
    </ul>
);

const SearchBox1 = ({
    currentRefinement,
    refine
}: {
    currentRefinement: any;
    refine: any;
}) => (
    <SearchInput
        value={currentRefinement}
        onChange={(event: any) => refine(event.currentTarget.value)}
        placeholder="Search Returns..."
        width="100%"
        height={44}
    />
);

const CustomSearchBox = connectSearchBox(SearchBox1);

const CustomReturnHits = connectHits(ReturnHits);

const IndexResults = connectStateResults(({ searchState, searchResults }) =>
    searchResults && searchResults.nbHits !== 0 && searchState.query ? (
        <div>
            <Heading marginTop={8}>Returns: </Heading>
            <CustomReturnHits />
        </div>
    ) : (
        <div>{searchResults ? ' ' : ''}</div>
    )
);

interface IProps {
    searchState: any;
    resultsState: any[];
    onSearchStateChange: () => void;
    createURL: () => void;
    indexName: string;
    shop: string;
}
export class SearchBox extends React.Component<IProps> {
    static propTypes = {};

    render() {
        // const filters = 'shopid:demostore7718.myshopify.com' + this.props.shop;
        const filters = 'shopid:demostore7718.myshopify.com';
        return (
            <div className="searchSection">
                <InstantSearch
                    {...this.props}
                    searchClient={searchClient}
                    indexName="prod_RMAI_returns"
                >
                    <Configure filters={filters} hitsPerPage={5} />
                    <CustomSearchBox />

                    <div>
                        <Index indexName="prod_RMAI_returns">
                            <IndexResults />
                        </Index>
                    </div>
                </InstantSearch>
            </div>
        );
    }
}
