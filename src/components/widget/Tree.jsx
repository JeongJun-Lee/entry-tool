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
                                <div dangerouslySetInnerHTML={{ __html: treeHtml }} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Tree;

const drawTree = (source) => {
    const { graphData, fields, valueMap, yes = 'yes', no = 'no' } = source;
    const { splitColumn, splitValue, distribution, left, right } = graphData;
    let feature = null;
    let prediction = null;
    if (graphData.featureName !== undefined) {
        feature = graphData.featureName;
    } else if (splitColumn !== null && splitColumn !== undefined) {
        feature = fields[splitColumn + 1] || fields[splitColumn];
    }
    if (graphData.predictionLabel !== undefined && graphData.predictionLabel !== null) {
        prediction = graphData.predictionLabel;
    } else if (distribution !== null && distribution !== undefined) {
        let d = distribution.data ? distribution.data : distribution;
        while (Array.isArray(d) && d.length === 1) {
            d = d[0];
        }
        if (Array.isArray(d)) {
            if (d.length > 0) {
                const sorted = [...d].sort((a, b) => b - a);
                const maxRowIndex = d.indexOf(sorted[0]);
                prediction = valueMap[maxRowIndex + 1] !== undefined ? valueMap[maxRowIndex + 1] : valueMap[maxRowIndex];
                if (prediction === undefined || prediction === null) {
                    prediction = maxRowIndex;
                }
            }
        } else if (typeof d === 'object' && d !== null) {
            let bestClass = -1;
            let maxProb = -Infinity;
            for (const [k, v] of Object.entries(d)) {
                if (Number(v) > maxProb) {
                    maxProb = Number(v);
                    bestClass = Number(k);
                }
            }
            if (bestClass !== -1) {
                prediction = valueMap[bestClass + 1] !== undefined ? valueMap[bestClass + 1] : valueMap[bestClass];
                if (prediction === undefined || prediction === null) {
                    prediction = bestClass;
                }
            }
        } else if (typeof d !== 'object') {
            prediction = valueMap[Number(d) + 1] || valueMap[d] || d;
        }
    }
    // leaf
    if (!left && !right) {
        const leafLabel = (prediction !== undefined && prediction !== null && prediction !== '') ? prediction : 'Leaf';
        return [
            '<ul>',
            '<li>',
            '<a href="#">',
            '<b>',
            leafLabel,
            '</b>',
            '</a>',
            '</li>',
            '</ul>',
        ].join('');
    }
    return [
        '<ul>',
        '<li>',
        '<a href="#">',
        '<b>',
        feature,
        '<',
        _floor(splitValue, 2),
        '</b>',
        '</a>',
        '<ul>',
        '<li>',
        `<a href="#">${yes}</a>`,
        drawTree({ graphData: left, fields, valueMap, yes, no }),
        '</li>',
        '<li>',
        `<a href="#">${no}</a>`,
        drawTree({ graphData: right, fields, valueMap, yes, no }),
        '</li>',
        '</ul>',
        '</li>',
        '</ul>',
    ].join('');
};
