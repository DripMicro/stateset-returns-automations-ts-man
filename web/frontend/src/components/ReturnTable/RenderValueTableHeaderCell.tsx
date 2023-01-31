import {
    Menu,
    Popover,
    Position,
    Table,
    TextDropdownButton
} from 'evergreen-ui';
import React from 'react';
export enum Order {
    NONE,
    ASC,
    DESC
}

interface IProps {
    orderedColumn: number;
    ordering: Order;
    column2Show: string;
    setState: (key: string, value: any) => void;
}
interface IState {}
class RenderValueTableHeaderCell extends React.Component<IProps, IState> {
    constructor(props: IProps) {
        super(props);
    }
    render() {
        return (
            <Table.HeaderCell>
                <Popover
                    position={Position.BOTTOM_LEFT}
                    content={({ close }) => (
                        <Menu>
                            <Menu.OptionsGroup
                                title="Return"
                                options={[
                                    { label: 'Ascending', value: Order.ASC },
                                    { label: 'Descending', value: Order.DESC }
                                ]}
                                selected={
                                    this.props.orderedColumn === 2
                                        ? this.props.ordering
                                        : null
                                }
                                onChange={(value) => {
                                    // this.props.setState({
                                    //     orderedColumn: 2,
                                    //     ordering: value
                                    // });
                                    this.props.setState('orderedColumn', 2);
                                    this.props.setState('ordering', value);
                                    close();
                                }}
                            />

                            <Menu.Divider />

                            <Menu.OptionsGroup
                                title="Show"
                                options={[
                                    { label: 'Status', value: 'status' },
                                    { label: 'Issue', value: 'issue' },
                                    { label: 'Action', value: 'action_needed' },
                                    { label: 'Condition', value: 'condition' },
                                    {
                                        label: 'Reported Condition',
                                        value: 'reported_condition'
                                    },
                                    {
                                        label: 'Requested Date',
                                        value: 'requested_date'
                                    },
                                    {
                                        label: 'Shipped Date',
                                        value: 'shipped_date'
                                    },
                                    {
                                        label: 'Tracking Number',
                                        value: 'tracking_number'
                                    }
                                ]}
                                selected={this.props.column2Show}
                                onChange={(value) => {
                                    this.props.setState('column2Show', value);
                                    close();
                                }}
                            />
                        </Menu>
                    )}
                >
                    <TextDropdownButton>
                        {this.capitalize(this.props.column2Show)}
                    </TextDropdownButton>
                </Popover>
            </Table.HeaderCell>
        );
    }

    capitalize(str: string) {
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    }
}

export default RenderValueTableHeaderCell;
