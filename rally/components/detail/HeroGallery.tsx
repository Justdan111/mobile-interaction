import { Pressable, View } from 'react-native';
import { Image } from 'expo-image';
import { ChevronUpIcon } from '@/components/icons';
import { images, type ImageKey } from '@/data/images';

export function HeroGallery({
  imageKeys,
  index,
  onSelect,
}: {
  imageKeys: ImageKey[];
  index: number;
  onSelect: (next: number) => void;
}) {
  return (
    <View className="mx-5 aspect-[1.02] overflow-hidden rounded-[20px] bg-inset">
      <Image
        source={images[imageKeys[index]]}
        contentFit="contain"
        style={{ flex: 1, margin: 18 }}
        transition={180}
      />

      {/* The rail floats over the hero's right edge rather than sitting inside
          the padding, which is what gives it the detached, hovering look. */}
      <View className="absolute right-0 top-[18%] items-center rounded-2xl bg-surface p-2">
        {imageKeys.map((key, i) => (
          <Pressable
            key={key}
            onPress={() => onSelect(i)}
            accessibilityRole="button"
            accessibilityLabel={`View image ${i + 1}`}
            className={`m-1 h-[62px] w-[62px] items-center justify-center rounded-2xl ${
              i === index ? 'border-2 border-teal bg-teal-tint' : 'bg-surface'
            }`}
          >
            <Image
              source={images[key]}
              contentFit="contain"
              style={{ width: 44, height: 44 }}
            />
          </Pressable>
        ))}
        <View className="pb-1 pt-1">
          <ChevronUpIcon />
        </View>
      </View>
    </View>
  );
}
