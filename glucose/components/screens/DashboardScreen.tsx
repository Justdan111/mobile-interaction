import { Text, View } from 'react-native';
import { ScreenHeader } from '@/components/ScreenHeader';
import { TraceChart } from '@/components/charts/TraceChart';
import { InfoIcon, TrendTriangle } from '@/components/icons';
import { summary, today, trace, traceAxis } from '@/data/readings';

export function DashboardScreen({ width }: { width: number }) {
  const chartWidth = width - 40;

  return (
    <View className="flex-1" style={{ width }}>
      <ScreenHeader title="Dashboard." subtitle={today.label} />

      {/* The reading owns the screen: everything else is annotation. */}
      <View className="mt-[71px] px-5">
        <View className="flex-row items-baseline">
          <Text
            className="font-inter-bold text-[138px] leading-[138px] text-chalk"
            style={{ letterSpacing: -19 }}
          >
            {today.current}
          </Text>
          <Text
            className="ml-[21px] font-inter-medium text-[34px] text-chalk"
            style={{ letterSpacing: -0.5 }}
          >
            {today.unit}
          </Text>
        </View>
        <View className="absolute right-[24px] top-[43px]">
          <TrendTriangle direction={today.trend} />
        </View>
      </View>

      <View className="mt-[60px] px-5">
        <TraceChart values={trace} axis={traceAxis} width={chartWidth} />
      </View>

      <View className="mt-[55px] px-5">
        <View className="flex-row items-center justify-between">
          <Text className="font-inter-medium text-[22px] leading-[26px] text-chalk">
            Summary
          </Text>
          <InfoIcon />
        </View>
        <View className="mt-[9px] h-[1px] bg-rule" />

        {/* Three columns on a 39% grid — the trailing stat lands where the
            comp puts it, well short of the right margin. */}
        <View className="mt-5 flex-row">
          {summary.map((stat, i) => (
            <View
              key={stat.label}
              className={['w-[42%]', 'w-[39%]', ''][i] || undefined}
            >
              <Text className="font-inter text-[11px] leading-[14px] text-mist">
                {stat.label}
              </Text>
              <View className="mt-1.5 flex-row items-baseline">
                <Text
                  className="font-inter-bold text-[32px] leading-[36px] text-chalk"
                  style={{ letterSpacing: -1 }}
                >
                  {stat.value}
                </Text>
                <Text className="ml-1.5 font-inter text-[12px] text-mist">
                  {stat.unit}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}
