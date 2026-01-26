import React from 'react';
import {
    Play,
    Filter,
    Download,
    Ticket,
    FileText
} from 'lucide-react';
import './SecurityReview.css';

const SecurityReview = () => {
    return (
        <div className="page-container">
            <header className="page-header">
                <div className="breadcrumb">
                    <span className="text-muted">Pages / Security Review</span>
                    <h1 className="page-title">Active Assessment: Project Titan</h1>
                </div>
                <button className="btn-primary" onClick={() => {
                    alert('Security Review: This would trigger a new security review scan. Navigate to "Add Artifact" page to submit new artifacts for analysis.');
                    window.location.href = '/add-artifact';
                }}>
                    <Play size={16} fill="black" />
                    Run Security Review
                </button>
            </header>

            {/* Metrics */}
            <div className="stats-row">
                <div className="stat-card-simple">
                    <div className="text-muted text-xs font-bold mb-2">Critical & High Severity</div>
                    <div className="text-3xl font-bold text-white mb-1">12</div>
                    <div className="text-xs text-red-400">+2 new since yesterday</div>
                </div>
                <div className="stat-card-simple">
                    <div className="text-muted text-xs font-bold mb-2">Medium Severity</div>
                    <div className="text-3xl font-bold text-white mb-1">45</div>
                    <div className="text-xs text-muted">No change</div>
                </div>
                <div className="stat-card-simple">
                    <div className="text-muted text-xs font-bold mb-2">Low Severity</div>
                    <div className="text-3xl font-bold text-white mb-1">3</div>
                    <div className="text-xs text-green-400">5 resolved</div>
                </div>
            </div>

            <div className="mb-4 flex justify-between items-center">
                <h3 className="font-semibold text-lg">Identified Findings</h3>
                <div className="flex gap-2">
                    <button className="btn-secondary sm" onClick={() => alert('Filter functionality: This would allow you to filter findings by severity, component, or status.')}><Filter size={14} /> Filter</button>
                    <button className="btn-secondary sm" onClick={() => alert('Export functionality: This would export the findings table to CSV or JSON format.')}><Download size={14} /> Export</button>
                </div>
            </div>

            <div className="findings-table-container">
                <table className="findings-table">
                    <thead>
                        <tr>
                            <th>FINDING</th>
                            <th>SEVERITY</th>
                            <th>COMPONENT</th>
                            <th>RISK LEVEL</th>
                            <th>STATUS</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr className="active-row">
                            <td>
                                <div className="font-medium text-white">SQL Injection Vulnerability</div>
                                <div className="text-xs text-muted">CVE-2024-8932</div>
                            </td>
                            <td><span className="badge-high">High</span></td>
                            <td className="text-mono text-sm">auth-service/login.ts</td>
                            <td className="text-sm">Critical</td>
                            <td><span className="status-dot red">Open</span></td>
                        </tr>
                        <tr>
                            <td>
                                <div className="font-medium text-white">Cross-Site Scripting (Reflected)</div>
                                <div className="text-xs text-muted">CWE-79</div>
                            </td>
                            <td><span className="badge-medium">Medium</span></td>
                            <td className="text-mono text-sm">frontend/search.tsx</td>
                            <td className="text-sm">Moderate</td>
                            <td><span className="status-dot orange">In Review</span></td>
                        </tr>
                        <tr>
                            <td>
                                <div className="font-medium text-white">Outdated Dependency (Lodash)</div>
                                <div className="text-xs text-muted">npm-audit-1293</div>
                            </td>
                            <td><span className="badge-low">Low</span></td>
                            <td className="text-mono text-sm">package.json</td>
                            <td className="text-sm">Low</td>
                            <td><span className="status-dot green">Resolved</span></td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div className="detail-panel mt-6">
                <div className="detail-panel-header">
                    <h3>Detailed Analysis: SQL Injection Vulnerability</h3>
                    <div className="flex gap-2">
                        <button className="btn-secondary sm" onClick={() => alert('View Logs: This would display the raw application logs related to this vulnerability.')}><FileText size={14} /> View Logs</button>
                        <button className="btn-secondary sm" onClick={() => alert('Assign Ticket: This would create and assign a ticket to a team member for remediation.')}><Ticket size={14} /> Assign Ticket</button>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-6 p-6">
                    <div className="bg-black p-4 rounded border border-gray-800 font-mono text-xs">
                        <div className="text-gray-500 mb-2">// auth-service/login.ts : Line 42</div>
                        <div className="text-green-400">const query = "SELECT * FROM users WHERE username = '" + username + "' AND password = '" + password + "'";</div>
                        <div className="text-white mt-1">db.execute(query, (err, result) ={'>'} {'{'} if (err) throw err; ... {'}'});</div>

                        <div className="mt-4 pt-4 border-t border-gray-800">
                            <div className="text-gray-500 mb-1">REQUEST TRACE</div>
                            <div className="text-gray-400"> POST /api/v1/auth/login Payload: {'{'} "username": "admin' --", "password": "random" {'}'} Status: 200 OK (Unexpected Success)</div>
                        </div>
                    </div>

                    <div>
                        <div className="mb-4">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-2 h-2 rounded-full bg-cyan-400"></div>
                                <h4 className="text-cyan-400 font-bold text-sm">Attack Vector Identified</h4>
                            </div>
                            <p className="text-sm text-gray-400 leading-relaxed">
                                The provided code snippet demonstrates a classic SQL Injection vulnerability. The user input username is directly concatenated into the SQL query string without sanitization or parameterization.
                            </p>
                        </div>
                        <div className="mb-4">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-2 h-2 rounded-full bg-purple-400"></div>
                                <h4 className="text-purple-400 font-bold text-sm">Impact Assessment</h4>
                            </div>
                            <ul className="list-disc list-inside text-sm text-gray-400 leading-relaxed pl-1">
                                <li>Confidentiality Loss: Attackers can bypass authentication as administrator.</li>
                                <li>Data Integrity: Potential to drop tables or modify user records.</li>
                                <li>Availability: Denial of service via resource exhaustion queries.</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default SecurityReview;
