import { mount } from 'enzyme';
import * as React from 'react';
import { Item } from '../AccordionStore/AccordionStore';
import { AccordionContainer, Consumer, Provider } from './AccordionContext';

const DEFAULT_ITEM: Item = {
    uuid: 'foo',
    expanded: false,
};

describe('Accordion', () => {
    it('correctly instantiates with all expected methods', () => {
        const container = mount(<Provider />).instance() as Provider;
        expect(container).toBeDefined();
        expect(container.addItem).toBeDefined();
        expect(container.removeItem).toBeDefined();
        expect(container.setExpanded).toBeDefined();
    });

    it('works without any props', () => {
        const mock = jest.fn(() => null);

        mount(
            <Provider>
                <Consumer>{mock}</Consumer>
            </Provider>,
        );

        expect(mock).toHaveBeenCalledWith({
            allowMultipleExpanded: false,
            allowZeroExpanded: false,
            items: [],
            addItem: expect.anything(),
            removeItem: expect.anything(),
            setExpanded: expect.anything(),
            isItemDisabled: expect.anything(),
        });
    });

    it('respects the `allowMultipleExpanded` prop', () => {
        const mock = jest.fn(() => null);

        mount(
            <Provider allowMultipleExpanded={true}>
                <Consumer>{mock}</Consumer>
            </Provider>,
        );

        expect(mock).toHaveBeenCalledWith(
            expect.objectContaining({
                allowMultipleExpanded: true,
            }),
        );
    });

    it('respects the `allowZeroExpanded` prop', () => {
        const mock = jest.fn(() => null);

        mount(
            <Provider allowZeroExpanded={true}>
                <Consumer>{mock}</Consumer>
            </Provider>,
        );

        expect(mock).toHaveBeenCalledWith(
            expect.objectContaining({
                allowZeroExpanded: true,
            }),
        );
    });

    it('respects the `items` prop', () => {
        const mock = jest.fn(() => null);
        const items = [DEFAULT_ITEM];

        mount(
            <Provider initialItems={items}>
                <Consumer>{mock}</Consumer>
            </Provider>,
        );

        expect(mock).toHaveBeenCalledWith(
            expect.objectContaining({
                items,
            }),
        );
    });

    it('can add an item', () => {
        const mock = jest.fn(() => null);

        const instance = mount(
            <Provider>
                <Consumer>{mock}</Consumer>
            </Provider>,
        ).instance() as Provider;

        expect(mock).toHaveBeenCalledWith(
            expect.objectContaining({ items: [] }),
        );

        instance.addItem(DEFAULT_ITEM);

        expect(mock).toHaveBeenCalledWith(
            expect.objectContaining({ items: [DEFAULT_ITEM] }),
        );
    });

    it('can remove an item when more than one is expanded', () => {
        const mock = jest.fn(() => null);
        const itemFoo = { ...DEFAULT_ITEM, expanded: true, uuid: 'foo' };
        const itemBar = { ...DEFAULT_ITEM, expanded: true, uuid: 'bar' };
        const items = [itemFoo, itemBar];

        const instance = mount(
            <Provider initialItems={items}>
                <Consumer>{mock}</Consumer>
            </Provider>,
        ).instance() as Provider;

        expect(mock).toHaveBeenCalledWith(
            expect.objectContaining({
                items,
            }),
        );

        instance.removeItem(itemFoo.uuid);

        expect(mock).toHaveBeenCalledWith(
            expect.objectContaining({
                items: [itemBar],
            }),
        );
    });

    it("can't remove an item when only one is expanded and the accordion doesn't allow zero expansions", () => {
        const mock = jest.fn(() => null);
        const itemFoo = { ...DEFAULT_ITEM, expanded: true, uuid: 'foo' };
        const items = [itemFoo];

        const instance = mount(
            <Provider initialItems={items}>
                <Consumer>{mock}</Consumer>
            </Provider>,
        ).instance() as Provider;

        expect(mock).toHaveBeenCalledWith(
            expect.objectContaining({
                items,
            }),
        );

        instance.removeItem(itemFoo.uuid);

        expect(mock).toHaveBeenCalledWith(
            expect.objectContaining({
                items: [itemFoo],
            }),
        );
    });

    it('can remove an item in an accordion that allows zero expansions when only one item is expanded', () => {
        const mock = jest.fn(() => null);
        const itemFoo = { ...DEFAULT_ITEM, expanded: true, uuid: 'foo' };
        const items = [itemFoo];

        const instance = mount(
            <Provider allowZeroExpanded={true} initialItems={items}>
                <Consumer>{mock}</Consumer>
            </Provider>,
        ).instance() as Provider;

        expect(mock).toHaveBeenCalledWith(
            expect.objectContaining({
                items,
            }),
        );

        instance.removeItem(itemFoo.uuid);

        expect(mock).toHaveBeenCalledWith(
            expect.objectContaining({
                items: [],
            }),
        );
    });

    it("adding an expanded item to an accordion that doesn't allow multiple expansions closes other items", () => {
        const mock = jest.fn(() => null);
        const instance = mount(
            <Provider
                initialItems={[
                    { ...DEFAULT_ITEM, uuid: 'foo', expanded: true },
                ]}
            >
                <Consumer>{mock}</Consumer>
            </Provider>,
        ).instance() as Provider;

        instance.addItem({
            ...DEFAULT_ITEM,
            uuid: 'bar',
            expanded: true,
        });

        expect(mock).toHaveBeenCalledWith(
            expect.objectContaining({
                items: [
                    expect.objectContaining({ uuid: 'foo', expanded: false }),
                    expect.objectContaining({ uuid: 'bar', expanded: true }),
                ],
            }),
        );
    });

    it("adding an expanded item to an accordion that allows multiple expansions doesn't close other items", () => {
        const mock = jest.fn(() => null);
        const instance = mount(
            <Provider
                allowMultipleExpanded={true}
                initialItems={[
                    { ...DEFAULT_ITEM, uuid: 'foo', expanded: true },
                ]}
            >
                <Consumer>{mock}</Consumer>
            </Provider>,
        ).instance() as Provider;

        instance.addItem({
            ...DEFAULT_ITEM,
            uuid: 'bar',
            expanded: true,
        });

        expect(mock).toHaveBeenCalledWith(
            expect.objectContaining({
                items: [
                    expect.objectContaining({ uuid: 'foo', expanded: true }),
                    expect.objectContaining({ uuid: 'bar', expanded: true }),
                ],
            }),
        );
    });

    it('can expand an item', () => {
        const mock = jest.fn(() => null);
        const item = {
            ...DEFAULT_ITEM,
            expanded: false,
        };

        const instance = mount(
            <Provider initialItems={[item]}>
                <Consumer>{mock}</Consumer>
            </Provider>,
        ).instance() as Provider;

        instance.setExpanded(item.uuid, !item.expanded);

        expect(mock).toHaveBeenCalledWith(
            expect.objectContaining({
                items: [
                    {
                        ...item,
                        expanded: !item.expanded,
                    },
                ],
            }),
        );
    });

    it("setting the expanded property to true in an accordion that doesn't allow multiple expansions closes all other items", () => {
        const mock = jest.fn(() => null);
        const fooItem = {
            ...DEFAULT_ITEM,
            uuid: 'foo',
            expanded: true,
        };
        const barItem = {
            ...DEFAULT_ITEM,
            uuid: 'bar',
            expanded: false,
        };

        const instance = mount(
            <Provider initialItems={[fooItem, barItem]}>
                <Consumer>{mock}</Consumer>
            </Provider>,
        ).instance() as Provider;

        instance.setExpanded(barItem.uuid, true);

        expect(mock).toHaveBeenCalledWith(
            expect.objectContaining({
                items: [
                    expect.objectContaining({ expanded: false }),
                    expect.objectContaining({ expanded: true }),
                ],
            }),
        );
    });

    it("setting the expanded property to true in an accordion that allows multiple expansions doesn't close all other items", () => {
        const mock = jest.fn(() => null);
        const fooItem = {
            ...DEFAULT_ITEM,
            uuid: 'foo',
            expanded: true,
        };
        const barItem = {
            ...DEFAULT_ITEM,
            uuid: 'bar',
            expanded: false,
        };

        const instance = mount(
            <Provider
                allowMultipleExpanded={true}
                initialItems={[fooItem, barItem]}
            >
                <Consumer>{mock}</Consumer>
            </Provider>,
        ).instance() as Provider;

        instance.setExpanded(barItem.uuid, true);

        expect(mock).toHaveBeenCalledWith(
            expect.objectContaining({
                items: [
                    expect.objectContaining({ expanded: true }),
                    expect.objectContaining({ expanded: true }),
                ],
            }),
        );
    });

    it('setting the expanded property to false in an accordion that allows zero expansions when there is only one item expanded closes that item', () => {
        const mock = jest.fn(() => null);
        const fooItem = {
            ...DEFAULT_ITEM,
            uuid: 'foo',
            expanded: true,
        };

        const instance = mount(
            <Provider allowZeroExpanded={true} initialItems={[fooItem]}>
                <Consumer>{mock}</Consumer>
            </Provider>,
        ).instance() as Provider;

        instance.setExpanded(fooItem.uuid, false);

        expect(mock).toHaveBeenCalledWith(
            expect.objectContaining({
                items: [expect.objectContaining({ expanded: false })],
            }),
        );
    });

    it("setting the expanded property to false in an accordion that doesn't allow zero expansions when there is only one item expanded doesn't close that item", () => {
        const mock = jest.fn(() => null);
        const fooItem = {
            ...DEFAULT_ITEM,
            uuid: 'foo',
            expanded: true,
        };

        const instance = mount(
            <Provider initialItems={[fooItem]}>
                <Consumer>{mock}</Consumer>
            </Provider>,
        ).instance() as Provider;

        instance.setExpanded(fooItem.uuid, false);

        expect(mock).toHaveBeenCalledWith(
            expect.objectContaining({
                items: [expect.objectContaining({ expanded: true })],
            }),
        );
    });

    it("setting the expanded property to false on an item in an accordion that doesn't allow zero expansions when there are more than one item expanded closes that item", () => {
        const mock = jest.fn(() => null);
        const fooItem = {
            ...DEFAULT_ITEM,
            uuid: 'foo',
            expanded: true,
        };
        const barItem = {
            ...DEFAULT_ITEM,
            uuid: 'bar',
            expanded: true,
        };

        const instance = mount(
            <Provider initialItems={[fooItem, barItem]}>
                <Consumer>{mock}</Consumer>
            </Provider>,
        ).instance() as Provider;

        instance.setExpanded(fooItem.uuid, false);

        expect(mock).toHaveBeenCalledWith(
            expect.objectContaining({
                items: [
                    expect.objectContaining({ expanded: false }),
                    expect.objectContaining({ expanded: true }),
                ],
            }),
        );
    });

    /*
     * These tests were mostly added to assert that the callback-style setState
     * was being used and race-conditions weren't causing multiple setState
     * calls to cancel one-another out.
     */
    describe('Race conditions', () => {
        it('can add multiple items at the same time', () => {
            const mock = jest.fn(() => null);
            const fooItem = {
                ...DEFAULT_ITEM,
                uuid: 'foo',
                expanded: true,
            };
            const barItem = {
                ...DEFAULT_ITEM,
                uuid: 'bar',
                expanded: false,
            };

            const instance = mount(
                <Provider>
                    <Consumer>{mock}</Consumer>
                </Provider>,
            ).instance() as Provider;

            instance.addItem(fooItem);
            instance.addItem(barItem);

            expect(mock).toHaveBeenCalledWith(
                expect.objectContaining({
                    items: [fooItem, barItem],
                }),
            );
        });

        it('can remove multiple items at the same time in an accordion that allows zero items to be expanded', () => {
            const mock = jest.fn(() => null);
            const fooItem = {
                ...DEFAULT_ITEM,
                uuid: 'foo',
                expanded: true,
            };
            const barItem = {
                ...DEFAULT_ITEM,
                uuid: 'bar',
                expanded: false,
            };

            const instance = mount(
                <Provider
                    allowZeroExpanded={true}
                    initialItems={[fooItem, barItem]}
                >
                    <Consumer>{mock}</Consumer>
                </Provider>,
            ).instance() as Provider;

            instance.removeItem(fooItem.uuid);
            instance.removeItem(barItem.uuid);

            expect(mock).toHaveBeenCalledWith(
                expect.objectContaining({
                    items: [],
                }),
            );
        });

        it('can remove multiple items at the same time when there are more than that number of items expanded', () => {
            const mock = jest.fn(() => null);
            const fooItem = {
                ...DEFAULT_ITEM,
                uuid: 'foo',
                expanded: true,
            };
            const barItem = {
                ...DEFAULT_ITEM,
                uuid: 'bar',
                expanded: false,
            };
            const bazItem = {
                ...DEFAULT_ITEM,
                uuid: 'baz',
                expanded: false,
            };

            const instance = mount(
                <Provider
                    allowZeroExpanded={true}
                    initialItems={[fooItem, barItem, bazItem]}
                >
                    <Consumer>{mock}</Consumer>
                </Provider>,
            ).instance() as Provider;

            instance.removeItem(fooItem.uuid);
            instance.removeItem(barItem.uuid);

            expect(mock).toHaveBeenCalledWith(
                expect.objectContaining({
                    items: [bazItem],
                }),
            );
        });

        it("can't remove multiple items at the same time when there are only that number of items expanded in an accordion that doesn't allow zero expansions", () => {
            const mock = jest.fn(() => null);
            const fooItem = {
                ...DEFAULT_ITEM,
                uuid: 'foo',
                expanded: true,
            };
            const barItem = {
                ...DEFAULT_ITEM,
                uuid: 'bar',
                expanded: false,
            };

            const instance = mount(
                <Provider initialItems={[fooItem, barItem]}>
                    <Consumer>{mock}</Consumer>
                </Provider>,
            ).instance() as Provider;

            instance.removeItem(fooItem.uuid);
            instance.removeItem(barItem.uuid);

            expect(mock).toHaveBeenCalledWith(
                expect.objectContaining({
                    items: [fooItem, barItem],
                }),
            );
        });

        it('can update expanded state of multiple items at the same time in an accordion that allows multiple expansions', () => {
            const mock = jest.fn(() => null);
            const fooItem = {
                ...DEFAULT_ITEM,
                uuid: 'foo',
                expanded: false,
            };
            const barItem = {
                ...DEFAULT_ITEM,
                uuid: 'bar',
                expanded: false,
            };

            const instance = mount(
                <Provider
                    allowMultipleExpanded={true}
                    initialItems={[fooItem, barItem]}
                >
                    <Consumer>{mock}</Consumer>
                </Provider>,
            ).instance() as Provider;

            instance.setExpanded(fooItem.uuid, true);
            instance.setExpanded(barItem.uuid, true);

            expect(mock).toHaveBeenCalledWith(
                expect.objectContaining({
                    items: [
                        expect.objectContaining({ expanded: true }),
                        expect.objectContaining({ expanded: true }),
                    ],
                }),
            );
        });
    });

    it('raises console error in case of duplicate uuid', () => {
        const uuid = 'uniqueCustomID';
        jest.spyOn(global.console, 'error');

        const instance = mount(<Provider />).instance() as Provider;

        instance.addItem({
            ...DEFAULT_ITEM,
            uuid,
            expanded: false,
        });
        instance.addItem({
            ...DEFAULT_ITEM,
            uuid,
            expanded: false,
        });

        // tslint:disable-next-line:no-console
        expect(console.error).toBeCalled();
    });

    it("triggers 'onChange' with array of expanded uuids when accordion doesn't allow multiple expansions", () => {
        const onChange = jest.fn();
        const item = {
            ...DEFAULT_ITEM,
            expanded: false,
        };

        const instance = mount(
            <Provider initialItems={[item]} onChange={onChange} />,
        ).instance() as Provider;

        instance.setExpanded(item.uuid, true);

        expect(onChange).toHaveBeenCalledWith([item.uuid]);
    });

    it('triggers "onChange" with array of expanded uuids when accordion allows multiple expansions', () => {
        const onChange = jest.fn();
        const item = {
            ...DEFAULT_ITEM,
            expanded: false,
        };

        const instance = mount(
            <Provider
                allowMultipleExpanded={true}
                initialItems={[item]}
                onChange={onChange}
            />,
        ).instance() as Provider;

        instance.setExpanded(item.uuid, true);

        expect(onChange).toHaveBeenCalledWith([item.uuid]);
    });
});
