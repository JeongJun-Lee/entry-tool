import { CommonUtils } from '@utils/Common';

export default ({ theme, item, onDelete }) => {
    const { name } = CommonUtils.getImageSummary(item);

    return (
        <li>
            <div className={theme.thmb}>
                <span className={theme.text_box}>{name}</span>
            </div>
            <a className={theme.btn_del} onClick={onDelete}>
                <span className={theme.blind}>{CommonUtils.getLang('Buttons.delete')}</span>
        </a>
    </li>
    );
}