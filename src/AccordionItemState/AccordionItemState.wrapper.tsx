import * as React from 'react';
import * as propTypes from '../helpers/propTypes';

import {
    AccordionContainer,
    Consumer as AccordionConsumer,
    Item,
} from '../AccordionContainer/AccordionContainer';
import {
    Consumer as ItemConsumer,
    ItemContainer,
} from '../ItemContainer/ItemContainer';

import AccordionItemState from './AccordionItemState';

type AccordionItemStateWrapperProps = React.HTMLAttributes<HTMLDivElement> & {
    expanded?: boolean;
    children(expanded: boolean): JSX.Element;
};

export default class AccordionItemStateWrapper extends React.Component<
    AccordionItemStateWrapperProps
> {
    static defaultProps: AccordionItemStateWrapperProps = {
        children: (expanded: boolean): JSX.Element => null,
    };

    renderChildren = (
        accordionStore: AccordionContainer,
        itemStore: ItemContainer,
    ): JSX.Element => {
        const { uuid } = itemStore;
        const { items } = accordionStore;
        const item = items.filter(
            (stateItem: Item) => stateItem.uuid === uuid,
        )[0];
        const { children } = this.props;

        return item ? (
            <AccordionItemState expanded={item.expanded} children={children} />
        ) : null;
    };

    render(): JSX.Element {
        return (
            <AccordionConsumer>
                {(accordionStore: AccordionContainer): JSX.Element => (
                    <ItemConsumer>
                        {(itemStore: ItemContainer): JSX.Element =>
                            this.renderChildren(accordionStore, itemStore)
                        }
                    </ItemConsumer>
                )}
            </AccordionConsumer>
        );
    }
}