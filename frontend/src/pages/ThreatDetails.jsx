import React from 'react';
import {
    X,
    CheckCircle,
    Play
} from 'lucide-react';
import './ThreatDetails.css';

const ThreatDetails = ({ onClose }) => {
    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <div className="flex items-center gap-3">
                        <span className="badge-critical">Critical</span>
                        <h2 className="modal-title">SQL Injection vulnerability in login API</h2>
                    </div>
                    <div className="text-muted text-xs font-mono mt-1 ml-16">
                        ID: VULN-2024-0012 • Detected 2m ago
                    </div>
                </div>

                <div className="modal-body-grid">
                    {/* Left Code View */}
                    <div className="code-view-dark">
                        <div className="file-path">src/api/auth/login.ts</div>
                        <div className="code-block">
                            <div className="cl"><span className="ln">42</span> const {'{'} username, password {'}'} = req.body;</div>
                            <div className="cl"><span className="ln">43</span></div>
                            <div className="cl"><span className="ln">44</span> <span className="c-comment">// Validate input</span></div>
                            <div className="cl"><span className="ln">45</span> if (!username || !password) {'{'}</div>
                            <div className="cl"><span className="ln">46</span>   return res.status(400).json({'{'} error: 'Missing credentials' {'}'});</div>
                            <div className="cl"><span className="ln">47</span> {'}'}</div>
                            <div className="cl"><span className="ln">48</span></div>
                            <div className="cl"><span className="ln">49</span> <span className="c-comment">// VULNERABLE QUERY</span></div>
                            <div className="cl vul-highlight"><span className="ln">50</span> const query = `SELECT * FROM users WHERE username = '${'{'}username{'}'}'`;</div>
                            <div className="cl vul-highlight"><span className="ln">51</span> const user = await db.execute(query);</div>
                            <div className="cl"><span className="ln">52</span></div>
                            <div className="cl"><span className="ln">53</span> if (user && user.verifyPassword(password)) {'{'}</div>
                            <div className="cl"><span className="ln">54</span>   const token = generateToken(user);</div>
                            <div className="cl"><span className="ln">55</span>   return res.json({'{'} token {'}'});</div>
                            <div className="cl"><span className="ln">56</span> {'}'}</div>
                        </div>

                        <div className="access-logs">
                            <div className="log-title">Access Logs (Last 10m)</div>
                            <div className="log-line">[10:42:01] POST /api/auth/login - 200 OK - 45ms</div>
                            <div className="log-line">[10:42:05] POST /api/auth/login - 500 ERROR - ' OR '1'='1</div>
                            <div className="log-line">[10:42:06] POST /api/auth/login - 200 OK - 120ms (Admin Access)</div>
                        </div>
                    </div>

                    {/* Right Analysis */}
                    <div className="analysis-view">
                        <h3 className="section-head">Threat Modeling Agent Analysis</h3>

                        <div className="mb-6">
                            <h4 className="sub-head white">Vulnerability Detected</h4>
                            <p className="analysis-text">
                                The code constructs a SQL query using direct string concatenation with user input <code>{`$\{username\}`}</code>. This allows an attacker to manipulate the query logic.
                            </p>
                        </div>

                        <div className="mb-6">
                            <h4 className="sub-head white">Attack Vector</h4>
                            <div className="vector-box">
                                <ul className="vector-list">
                                    <li>Attacker inputs <code>admin' --</code> as username.</li>
                                    <li>Query becomes: <code>SELECT * FROM users WHERE username = 'admin' --'.</code></li>
                                    <li>Database ignores password check due to comment <code>--</code>.</li>
                                    <li>Result: Unauthorized admin access granted.</li>
                                </ul>
                            </div>
                        </div>

                        <div className="mb-6">
                            <h4 className="sub-head white">Recommended Fix</h4>
                            <div className="fix-box">
                                <div className="text-sm text-gray-400 mb-2">Use parameterized queries to sanitize input automatically.</div>
                                <pre className="fix-code">
                                    {`const query = 'SELECT * FROM users WHERE username = ?';
const user = await db.execute(query, [username]);`}
                                </pre>
                            </div>
                        </div>

                        <div className="modal-actions">
                            <button className="btn-apply">Apply Fix</button>
                            <button className="btn-dismiss" onClick={onClose}>Dismiss</button>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default ThreatDetails;
