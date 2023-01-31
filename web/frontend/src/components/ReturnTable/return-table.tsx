import {
    Table,
    Spinner,
    Avatar,
    Text,
    Badge,
    Popover,
    Position,
    Menu
} from 'evergreen-ui';
import { useAppQuery, useAuthenticatedFetch } from '@/hooks';
import { useEffect, useMemo, useState } from 'react';
import { Card, Link, Stack } from '@shopify/polaris';
import { filter } from 'fuzzaldrin-plus';

import RenderValueTableHeaderCell, {
    Order
} from './RenderValueTableHeaderCell';

interface IReturn {
    customerEmail: string;
    status: string;
    rma: string;
    tracking_number: number;
    requested_date: string;
    id: string;
}

interface IParams {
    orderedColumn: number;
    ordering: Order;
    column2Show: string;
}

export function ReturnTable({ refetchAll }: { refetchAll: boolean }) {
    const {
        data,
        isLoading: isLoadingReturn,
        refetch,
        isRefetching
    } = useAppQuery({
        url: '/api/returns/all',
        reactQueryOptions: {}
    });

    const [searchQuery, setSearchQuery] = useState<string>('');
    const [params, setParams] = useState<IParams>({
        orderedColumn: 1,
        ordering: Order.NONE,
        column2Show: 'status'
    });
    // console.log(searchQuery);
    const renderData = useMemo(() => {
        if (searchQuery === undefined || searchQuery?.length === 0) return data;
        const returns = data.filter((returnX: any) => {
            const result = filter([returnX.customerEmail], searchQuery);
            return result.length === 1;
        });
        // console.log(returns);
        const { ordering, orderedColumn } = params;

        if (ordering === Order.NONE) return returns;

        // Get the property to sort each profile on.
        // By default use the `name` property.
        let propKey = 'customerEmail';
        // The second column is dynamic.
        if (orderedColumn === 2) propKey = params.column2Show;
        // The third column is fixed to the `zendesk_number` property.
        if (orderedColumn === 3) propKey = 'zendesk_number';
        // The fourth column is fixed to the `tracking_number` property.
        if (orderedColumn === 4) propKey = 'tracking_number';
        // The fifth column is fixed to the `requested_date` property.
        if (orderedColumn === 5) propKey = 'requested_date';

        return returns.sort((a: any, b: any) => {
            let aValue = a[propKey];
            let bValue = b[propKey];

            // Support string comparison
            const sortTable = { true: 1, false: -1 };

            // Order ascending (Order.ASC)
            if (params.ordering === Order.ASC) {
                return aValue === bValue
                    ? 0
                    : sortTable[aValue > bValue ? 'true' : 'false'];
            }

            // Order descending (Order.DESC)
            return bValue === aValue
                ? 0
                : sortTable[bValue > aValue ? 'true' : 'false'];
        });
    }, [data, params, searchQuery]);
    // console.log(renderData);
    useEffect(() => {
        if (!refetchAll) {
            console.log(refetchAll, 'table');
            refetch();
        }
    }, [refetchAll]);

    const handleFilterChange = (value: string) => setSearchQuery(value.trim());

    const setState = (key: string, value: any) => {
        setParams({
            ...params,
            [key]: value
        });
    };

    return (
        <div
            style={{
                marginBottom: 'var(--p-space-16)'
            }}
        >
            <Card>
                <Card.Section>
                    <Table border alignItems="flex-start">
                        <Table.Head height={30}>
                            <Table.SearchHeaderCell
                                onChange={handleFilterChange}
                                value={searchQuery}
                            />
                            {/* {renderValueTableHeaderCell()} */}
                            <RenderValueTableHeaderCell
                                orderedColumn={params.orderedColumn}
                                ordering={params.ordering}
                                column2Show={params.column2Show}
                                setState={setState}
                            />
                            <Table.TextHeaderCell>RMA</Table.TextHeaderCell>
                            <Table.TextHeaderCell>
                                Tracking Number
                            </Table.TextHeaderCell>
                            <Table.TextHeaderCell>
                                Requested Date
                            </Table.TextHeaderCell>
                        </Table.Head>
                        {isLoadingReturn || isRefetching ? (
                            <div
                                style={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    padding: 'var(--p-space-5)'
                                }}
                            >
                                <Spinner />
                            </div>
                        ) : (
                            <Table.Body height={500}>
                                {renderData
                                    ? Array.from<IReturn>(renderData).map(
                                          (item: IReturn) => (
                                              <Table.Row key={item.id}>
                                                  <Table.Cell
                                                      display="flex"
                                                      alignItems="center"
                                                  >
                                                      <Avatar
                                                          name={
                                                              item.customerEmail
                                                          }
                                                      />
                                                      <Text
                                                          marginLeft={8}
                                                          size={300}
                                                          fontWeight={500}
                                                      >
                                                          {item.customerEmail}
                                                      </Text>
                                                  </Table.Cell>
                                                  <Table.TextCell>
                                                      <Badge
                                                          color="yellow"
                                                          marginRight={8}
                                                      >
                                                          {
                                                              (item as any)[
                                                                  params
                                                                      .column2Show
                                                              ]
                                                          }
                                                      </Badge>
                                                  </Table.TextCell>
                                                  <Table.TextCell>
                                                      <Link
                                                          url={`/returnpage/${item.id}`}
                                                      >
                                                          {item.rma}
                                                      </Link>
                                                  </Table.TextCell>
                                                  <Table.TextCell isNumber>
                                                      {item.tracking_number}
                                                  </Table.TextCell>
                                                  <Table.TextCell isNumber>
                                                      {item.requested_date}
                                                  </Table.TextCell>
                                              </Table.Row>
                                          )
                                      )
                                    : null}
                            </Table.Body>
                        )}
                    </Table>
                </Card.Section>
            </Card>
        </div>
    );
}
