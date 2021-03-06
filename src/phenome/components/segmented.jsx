import Utils from '../utils/utils';
import Mixins from '../utils/mixins';

export default {
  name: 'f7-segmented',
  props: {
    id: [String, Number],
    className: String, // phenome-react-line
    style: Object, // phenome-react-line
    raised: Boolean,
    raisedIos: Boolean,
    raisedMd: Boolean,
    raisedAurora: Boolean,
    rectangle: Boolean,
    rectangleIos: Boolean,
    rectangleMd: Boolean,
    rectangleAurora: Boolean,
    round: Boolean,
    roundIos: Boolean,
    roundMd: Boolean,
    roundAurora: Boolean,
    strong: Boolean,
    strongIos: Boolean,
    strongMd: Boolean,
    strongAurora: Boolean,
    tag: {
      type: String,
      default: 'div',
    },
    ...Mixins.colorProps,
  },
  render() {
    const self = this;
    const props = self.props;
    const {
      className,
      raised,
      raisedIos,
      raisedAurora,
      raisedMd,
      rectangle,
      rectangleIos,
      rectangleAurora,
      rectangleMd,
      round,
      roundIos,
      roundAurora,
      roundMd,
      strong,
      strongIos,
      strongMd,
      strongAurora,
      id,
      style,
      tag,
    } = props;
    const classNames = Utils.classNames(
      className,
      {
        segmented: true,
        'segmented-raised': raised,
        'segmented-raised-ios': raisedIos,
        'segmented-raised-aurora': raisedAurora,
        'segmented-raised-md': raisedMd,
        'segmented-rectangle': rectangle,
        'segmented-rectangle-ios': rectangleIos,
        'segmented-rectangle-aurora': rectangleAurora,
        'segmented-rectangle-md': rectangleMd,
        'segmented-round': round,
        'segmented-round-ios': roundIos,
        'segmented-round-aurora': roundAurora,
        'segmented-round-md': roundMd,
        'segmented-strong': strong,
        'segmented-strong-ios': strongIos,
        'segmented-strong-md': strongMd,
        'segmented-strong-aurora': strongAurora,
      },
      Mixins.colorClasses(props),
    );
    const SegmentedTag = tag;

    return (
      <SegmentedTag
        id={id}
        style={style}
        className={classNames}
      >
        <slot />
        {(strong || strongIos || strongMd || strongAurora) && (
          <span className="segmented-highlight" />
        )}
      </SegmentedTag>
    );
  },
};
