import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const COLORS = ['#10b981', '#4f46e5', '#f59e0b', '#ef4444'];

const TaskCompletionChart = ({ data }) => {
    const chartData = [
        { name: 'Completed', value: data.completed || 0 },
        { name: 'In Progress', value: data['in-progress'] || 0 },
        { name: 'Review', value: data.review || 0 },
        { name: 'To Do', value: data.todo || 0 },
    ].filter(item => item.value > 0);

    return (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-96">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Task Status Distribution</h3>
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
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip />
                        <Legend verticalAlign="bottom" height={36} />
                    </PieChart>
                </ResponsiveContainer>
            ) : (
                <div className="flex items-center justify-center h-full text-slate-400">
                    No tasks found
                </div>
            )}
        </div>
    );
};

export default TaskCompletionChart;
