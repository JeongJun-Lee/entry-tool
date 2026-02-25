import Theme from '@utils/Theme';
import _floor from 'lodash/floor';

const Tree = (props) => {
    const theme = Theme.getStyle('popup');
    const { source = {}, onClose, isIframe, title } = props;
    const treeHtml = drawTree(source);

    return (
        <div className={theme.dimmed}>
            <div className={isIframe ? theme.center_chart : theme.center}>
                <div className={theme.modal}>
                    <div className={theme.head}>
                        <div className={theme.text}>{title}</div>
                        <div
                            className={theme.close}
                            id="chart_btn"
                            onClick={() => {
                                onClose();
                            }}
                        />
                    </div>
                    <div className={theme.body}>
                        <div className={theme.tree_container}>
                            <div className={theme.tree}>
                                <ul dangerouslySetInnerHTML={{ __html: treeHtml }} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Tree;

const drawTree = (source, labelPrefix = '') => {
    const { graphData, fields, valueMap, yes = 'yes', no = 'no' } = source;
    const { splitColumn, splitValue, distribution, left, right } = graphData;
    let feature = null;
    let prediction = null;
    if (graphData.featureName !== undefined) {
        feature = graphData.featureName;
    } else if (splitColumn !== null && splitColumn !== undefined) {
        feature = fields[splitColumn + 1] || fields[splitColumn];
    }
    if (graphData.predictionLabel !== undefined) {
        prediction = graphData.predictionLabel;
    } else if (distribution !== null && distribution !== undefined) {
        let d = distribution.data ? distribution.data : distribution;
        while (Array.isArray(d) && d.length === 1) {
            d = d[0];
        }
        if (typeof d === 'object' && d !== null) {
            let bestClass = -1;
            let maxProb = -Infinity;
            for (const [k, v] of Object.entries(d)) {
                if (Number(v) > maxProb) {
                    maxProb = Number(v);
                    bestClass = Number(k);
                }
            }
            if (bestClass !== -1) {
                let lbl = valueMap[bestClass + 1] !== undefined ? valueMap[bestClass + 1] : valueMap[bestClass];
                if (lbl !== undefined && lbl !== null && lbl !== '') {
                    prediction = lbl;
                }
            }
        }
    }

    const isLeafNode = !left && !right || (Object.keys(left || {}).length === 0 && Object.keys(right || {}).length === 0);
    let labelHtml = labelPrefix ? `<div class="label-box">${labelPrefix}</div>` : '';

    if (isLeafNode) {
        const predLabel = prediction !== undefined && prediction !== null ? prediction : 'Leaf';
        return [
            '<li>',
            labelHtml,
            '<a href="#">',
            '<b>',
            predLabel,
            '</b>',
            '</a>',
            '</li>',
        ].join('');
    }
    return [
        '<li>',
        labelHtml,
        '<a href="#">',
        '<b>',
        feature,
        '<',
        _floor(splitValue, 2),
        '</b>',
        '</a>',
        '<ul>',
        drawTree({ graphData: left, fields, valueMap, yes, no }, yes),
        drawTree({ graphData: right, fields, valueMap, yes, no }, no),
        '</ul>',
        '</li>',
    ].join('');
};
