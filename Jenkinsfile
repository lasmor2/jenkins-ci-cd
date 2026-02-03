pipeline {
    agent {
        kubernetes {
            yaml """
                apiVersion: v1
                kind: Pod
                spec:
                  containers:
                  - name: docker
                    image: docker:dind
                    securityContext:
                      privileged: true
                    volumeMounts:
                    - name: docker-sock
                      mountPath: /var/run/docker.sock
                  - name: kubectl
                    image: bitnami/kubectl:latest
                    command:
                    - sleep
                    args:
                    - 99d
                  - name: node
                    image: node:18-alpine
                    command:
                    - sleep
                    args:
                    - 99d
                  volumes:
                  - name: docker-sock
                    hostPath:
                      path: /var/run/docker.sock
            """
        }
    }
    
    triggers {
        githubPush()
    }
    
    environment {
        DOCKER_REGISTRY = 'docker.io/lasmor2025'
        REGISTRY_CREDENTIALS = credentials('docker-hub-creds')
        GITHUB_CREDENTIALS = credentials('github-token')
        BACKEND_IMAGE = "${DOCKER_REGISTRY}/backend"
        FRONTEND_IMAGE = "${DOCKER_REGISTRY}/frontend"
        GITHUB_REPO = 'lasmor2/jenkins-ci-cd'
    }
    
    stages {
        stage('Checkout') {
            steps {
                git branch: 'main',
                    credentialsId: 'github-token',
                    url: "https://github.com/${GITHUB_REPO}.git"
            }
        }
        
        stage('Install Dependencies') {
            parallel {
                stage('Backend Dependencies') {
                    steps {
                        container('node') {
                            dir('backend') {
                                sh 'npm ci'
                            }
                        }
                    }
                }
                stage('Frontend Dependencies') {
                    steps {
                        container('node') {
                            dir('frontend') {
                                sh 'npm ci'
                            }
                        }
                    }
                }
            }
        }
        
        stage('Test & Build') {
            parallel {
                stage('Backend Tests') {
                    steps {
                        container('node') {
                            dir('backend') {
                                sh 'npm run test'
                                sh 'npm run lint'
                            }
                        }
                    }
                }
                stage('Frontend Build') {
                    steps {
                        container('node') {
                            dir('frontend') {
                                sh 'npm run test'
                                sh 'npm run lint'
                                sh 'npm run build'
                            }
                        }
                    }
                }
            }
        }
        
        stage('Build Docker Images') {
            steps {
                container('docker') {
                    script {
                        docker.withRegistry('', env.REGISTRY_CREDENTIALS) {
                            parallel (
                                backend: {
                                    dir('backend') {
                                        def backendImage = docker.build("${BACKEND_IMAGE}:${BUILD_NUMBER}")
                                        backendImage.push()
                                        backendImage.push('latest')
                                    }
                                },
                                frontend: {
                                    dir('frontend') {
                                        def frontendImage = docker.build("${FRONTEND_IMAGE}:${BUILD_NUMBER}")
                                        frontendImage.push()
                                        frontendImage.push('latest')
                                    }
                                }
                            )
                        }
                    }
                }
            }
        }
        
        stage('Deploy to Production') {
            steps {
                container('docker') {
                    script {
                        echo "✅ Images pushed to Docker Hub successfully!"
                        echo "Backend: ${BACKEND_IMAGE}:${BUILD_NUMBER}"
                        echo "Frontend: ${FRONTEND_IMAGE}:${BUILD_NUMBER}"
                    }
                }
            }
        }
    }
    
    post {
        always {
            container('docker') {
                sh 'docker image prune -f || true'
            }
        }
        success {
            echo "✅ Pipeline completed successfully!"
            script {
                withCredentials([string(credentialsId: 'github-token', variable: 'GITHUB_TOKEN')]) {
                    sh """
                        curl -X POST \
                          -H "Authorization: token ${GITHUB_TOKEN}" \
                          -H "Accept: application/vnd.github.v3+json" \
                          https://api.github.com/repos/${GITHUB_REPO}/statuses/${GIT_COMMIT} \
                          -d '{"state":"success","description":"Deployment successful - Build ${BUILD_NUMBER}","context":"jenkins/deploy"}'
                    """
                }
            }
        }
        failure {
            echo "❌ Pipeline failed!"
            script {
                withCredentials([string(credentialsId: 'github-token', variable: 'GITHUB_TOKEN')]) {
                    sh """
                        curl -X POST \
                          -H "Authorization: token ${GITHUB_TOKEN}" \
                          -H "Accept: application/vnd.github.v3+json" \
                          https://api.github.com/repos/${GITHUB_REPO}/statuses/${GIT_COMMIT} \
                          -d '{"state":"failure","description":"Deployment failed - Build ${BUILD_NUMBER}","context":"jenkins/deploy","target_url":"${BUILD_URL}"}'
                    """
                }
            }
        }
    }
}