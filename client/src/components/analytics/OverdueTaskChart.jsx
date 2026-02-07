import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const OverdueTaskChart = ({ data }) => {
    const chartData = [
        { name: 'On Time/Completed', value: data.completed || 0, color: '#10b981' },
        { name: 'Overdue', value: data.overdue || 0, color: '#ef4444' },
    ].filter(item => item.value > 0);

    return (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-96">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Overdue vs Completed</h3>
            {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            fill="#8884d8"
                            paddingAngle={5}
                            dataKey="value"
                        >
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip />
                        <Legend verticalAlign="bottom" height={36} />
                    </PieChart>
                </ResponsiveContainer>
            ) : (
                <div className="flex items-center justify-center h-full text-slate-400">
                    No data available
                </div>
            )}
        </div>
    );
};

export default OverdueTaskChart;
