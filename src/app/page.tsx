import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Table } from '@/components/ui/table'

export default function Home() {
  return (
    <div className="space-y-8">
      <h1 className="text-4xl font-bold">Microagent Swarm Controller</h1>
      
      <Card className="p-6 bg-gray-900 border-gray-800">
        <h2 className="text-2xl mb-4">Swarm Status</h2>
        <div className="grid grid-cols-3 gap-4">
          <Button variant="outline">Cloud Agents: 0</Button>
          <Button variant="outline">Browser Agents: 0</Button>
          <Button variant="outline">Total Compute: 0 vCPUs</Button>
        </div>
      </Card>

      <Card className="p-6 bg-gray-900 border-gray-800">
        <h2 className="text-2xl mb-4">Task Distribution</h2>
        <Table className="w-full">
          <thead className="bg-gray-800">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Task ID</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Status</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Location</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Progress</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            <tr className="hover:bg-gray-800/50 transition-colors">
              <td className="px-4 py-3 text-sm text-gray-400">TASK-001</td>
              <td className="px-4 py-3">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-800/30 text-green-400">
                  Active
                </span>
              </td>
              <td className="px-4 py-3 text-sm text-gray-400">US-East-1</td>
              <td className="px-4 py-3 text-sm text-gray-400">
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full w-3/4"></div>
                </div>
              </td>
            </tr>
            {/* Add more rows as needed */}
          </tbody>
        </Table>
      </Card>
    </div>
  )
}
