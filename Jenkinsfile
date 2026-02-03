pipeline {
    agent any
    
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
                        script {
                            docker.image('node:20-alpine').inside('-u root') {
                                dir('backend') {
                                    sh 'npm ci --cache /tmp/.npm'
                                }
                            }
                        }
                    }
                }
                stage('Frontend Dependencies') {
                    steps {
                        script {
                            docker.image('node:20-alpine').inside('-u root') {
                                dir('frontend') {
                                    sh 'npm ci --cache /tmp/.npm'
                                }
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
                        script {
                            docker.image('node:20-alpine').inside('-u root') {
                                dir('backend') {
                                    sh 'npm run test'
                                    sh 'npm run lint'
                                }
                            }
                        }
                    }
                }
                stage('Frontend Build') {
                    steps {
                        script {
                            docker.image('node:20-alpine').inside('-u root') {
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
        }
        
        stage('Build Docker Images') {
            steps {
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
        
        stage('Deploy to Production') {
            steps {
                script {
                    echo "✅ Images pushed to Docker Hub successfully!"
                    echo "Backend: ${BACKEND_IMAGE}:${BUILD_NUMBER}"
                    echo "Frontend: ${FRONTEND_IMAGE}:${BUILD_NUMBER}"
                }
            }
        }
    }
    
    post {
        always {
            sh 'docker image prune -f || true'
        }
        success {
            echo "✅ Pipeline completed successfully!"
        }
        failure {
            echo "❌ Pipeline failed!"
        }
    }
}