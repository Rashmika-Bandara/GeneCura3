import { TrendingUp, TrendingDown } from 'lucide-react'

const DashboardHome = ({ cards, role }) => {
  const getRoleTitle = (role) => {
    switch (role) {
      case 'doctor':
        return 'Doctor Dashboard'
      case 'geneticist':
        return 'Clinical Geneticist Dashboard'
      case 'pharmacologist':
        return 'Clinical Pharmacologist Dashboard'
      default:
        return 'Dashboard'
    }
  }

  const getColorClasses = (color) => {
    const colors = {
      blue: {
        bg: 'bg-blue-50',
        icon: 'bg-blue-500',
        text: 'text-blue-600'
      },
      green: {
        bg: 'bg-green-50',
        icon: 'bg-green-500',
        text: 'text-green-600'
      },
      purple: {
        bg: 'bg-purple-50',
        icon: 'bg-purple-500',
        text: 'text-purple-600'
      },
      orange: {
        bg: 'bg-orange-50',
        icon: 'bg-orange-500',
        text: 'text-orange-600'
      },
      red: {
        bg: 'bg-red-50',
        icon: 'bg-red-500',
        text: 'text-red-600'
      }
    }
    return colors[color] || colors.blue
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Welcome to {getRoleTitle(role)}
        </h2>
        <p className="text-gray-600">
          Here's an overview of your activities and key metrics.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, index) => {
          const Icon = card.icon
          const colors = getColorClasses(card.color)
          
          return (
            <div key={index} className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <div className={`${colors.bg} rounded-md p-3`}>
                  <div className={`${colors.icon} rounded-md p-2`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="ml-4 flex-1">
                  <p className="text-sm font-medium text-gray-500">{card.title}</p>
                  <div className="flex items-baseline">
                    <p className="text-2xl font-semibold text-gray-900">{card.value}</p>
                    <div className="ml-2 flex items-baseline text-sm">
                      {card.changeType === 'increase' ? (
                        <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                      )}
                      <span className={`${card.changeType === 'increase' ? 'text-green-600' : 'text-red-600'} font-medium`}>
                        {card.change}
                      </span>
                      <span className="text-gray-500 ml-1">from last month</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {role === 'doctor' && (
            <>
              <button className="btn-primary text-left p-4 h-auto">
                <div className="font-medium">Add New Patient</div>
                <div className="text-sm opacity-90">Register a new patient in the system</div>
              </button>
              <button className="btn-secondary text-left p-4 h-auto">
                <div className="font-medium">Create Prescription</div>
                <div className="text-sm">Add a new prescription for a patient</div>
              </button>
              <button className="btn-secondary text-left p-4 h-auto">
                <div className="font-medium">Upload Report</div>
                <div className="text-sm">Submit a new medical report</div>
              </button>
            </>
          )}
          {role === 'geneticist' && (
            <>
              <button className="btn-primary text-left p-4 h-auto">
                <div className="font-medium">Add New Gene</div>
                <div className="text-sm opacity-90">Register new genetic information</div>
              </button>
              <button className="btn-secondary text-left p-4 h-auto">
                <div className="font-medium">Update Metabolizer</div>
                <div className="text-sm">Manage metabolizer details</div>
              </button>
              <button className="btn-secondary text-left p-4 h-auto">
                <div className="font-medium">Upload Report</div>
                <div className="text-sm">Submit a genetic analysis report</div>
              </button>
            </>
          )}
          {role === 'pharmacologist' && (
            <>
              <button className="btn-primary text-left p-4 h-auto">
                <div className="font-medium">Add New Medicine</div>
                <div className="text-sm opacity-90">Register new pharmaceutical data</div>
              </button>
              <button className="btn-secondary text-left p-4 h-auto">
                <div className="font-medium">View Drug Analysis</div>
                <div className="text-sm">Analyze drug variation history</div>
              </button>
              <button className="btn-secondary text-left p-4 h-auto">
                <div className="font-medium">Upload Report</div>
                <div className="text-sm">Submit a pharmacological report</div>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
        <div className="space-y-4">
          <div className="flex items-center space-x-3 text-sm">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-gray-500">2 hours ago</span>
            <span className="text-gray-900">Updated patient record for ID: PAT123</span>
          </div>
          <div className="flex items-center space-x-3 text-sm">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span className="text-gray-500">4 hours ago</span>
            <span className="text-gray-900">Submitted report: Genetic Analysis Summary</span>
          </div>
          <div className="flex items-center space-x-3 text-sm">
            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
            <span className="text-gray-500">1 day ago</span>
            <span className="text-gray-900">Created new prescription for patient PAT456</span>
          </div>
          <div className="flex items-center space-x-3 text-sm">
            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
            <span className="text-gray-500">2 days ago</span>
            <span className="text-gray-900">Report approved by administration</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardHome
