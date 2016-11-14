define([
    'react',
    'react-redux',
    'react-dom',
    'data/web-worker/store/selection/actions',
    'data/web-worker/store/product/actions',
    'data/web-worker/store/product/selectors',
    './worker/actions',
    'components/DroppableHOC',
    './Map'
], function(React, redux, ReactDom, selectionActions, productActions, productSelectors, mapActions, DroppableHOC, Map) {
    'use strict';

    const mimeTypes = [VISALLO_MIMETYPES.ELEMENTS];

    return redux.connect(

        (state, props) => {
            var ontologyProperties = state.ontology.properties,
                configProperties = state.configuration.properties,
                pixelRatio = state.screen.pixelRatio;

            return {
                ...props,
                configProperties,
                ontologyProperties,
                panelPadding: state.panel.padding,
                selection: productSelectors.getSelectedElementsInProduct(state),
                viewport: productSelectors.getViewport(state),
                elements: productSelectors.getElementsInProduct(state),
                pixelRatio,
                mimeTypes,
                style: { height: '100%' }
            }
        },

        (dispatch, props) => {
            return {
                onSelectElements: (selection) => dispatch(selectionActions.set(selection)),
                onSelectAll: (id) => dispatch(productActions.selectAll(id)),

                onUpdatePreview: (id, dataUrl) => dispatch(productActions.updatePreview(id, dataUrl)),

                // TODO: these should be mapActions
                onUpdateViewport: (id, { pan, zoom }) => dispatch(productActions.updateViewport(id, { pan, zoom })),

                // For DroppableHOC
                onDrop: (event) => {
                    const dataStr = event.dataTransfer.getData(VISALLO_MIMETYPES.ELEMENTS);
                    if (dataStr) {
                        event.preventDefault();
                        event.stopPropagation();

                        const data = JSON.parse(dataStr);
                        // TODO: mapActions
                        dispatch(mapActions.dropElements(props.product.id, data.elements))
                    }
                },

                onDropElementIds(elementIds) {
                    dispatch(mapActions.dropElements(props.product.id, elementIds));
                },

                onRemoveElementIds: (elementIds) => {
                    dispatch(productActions.removeElements(props.product.id, elementIds))
                },

                onVertexMenu: (element, vertexId, position) => {
                    $(element).trigger('showVertexContextMenu', { vertexId, position });
                }
            }
        }

    )(DroppableHOC(Map));
});
