pipeline {
    agent any

    options {
        skipDefaultCheckout(true)
    }

    environment {
        REGISTRY = "192.168.56.128:50000"
        IMAGE_NAME = "app"
        TAG = "latest"
        NEXUS_USER = "admin"
        NEXUS_PASSWORD = "password"
    }

    stages {

        stage('Checkout Code') {
            steps {
                echo "==> Checkout source code"
                deleteDir()
                git branch: 'main',
                    url: 'https://github.com/Mayochiki03/ci-cd-ha-demo.git'
            }
        }

        stage('Build Docker Image') {
            steps {
                echo "==> Build Docker image"
                sh '''
                  docker build -t ${IMAGE_NAME}:${TAG} .
                '''
            }
        }

        stage('Tag Image') {
            steps {
                echo "==> Tag image for Nexus"
                sh '''
                  docker tag ${IMAGE_NAME}:${TAG} ${REGISTRY}/${IMAGE_NAME}:${TAG}
                '''
            }
        }

        stage('Docker Login to Nexus') {
            steps {
                echo "==> Docker login to Nexus"
                withCredentials([
                    usernamePassword(
                        credentialsId: 'nexus-admin',
                        usernameVariable: 'NEXUS_USER',
                        passwordVariable: 'NEXUS_PASS'
                    )
                ]) {
                    sh '''
                      echo "$NEXUS_PASS" | docker login ${REGISTRY} \
                        -u "$NEXUS_USER" \
                        --password-stdin
                    '''
                }
            }
        }


        stage('Push Image to Nexus') {
            steps {
                echo "==> Push image to Nexus"
                sh '''
                  docker push ${REGISTRY}/${IMAGE_NAME}:${TAG}
                '''
            }
        }

        stage('Deploy to VM2') {
            steps {
                echo "==> Deploy to VM2"
                withCredentials([
                    usernamePassword(
                        credentialsId: 'nexus-admin',
                        usernameVariable: 'NEXUS_USER',
                        passwordVariable: 'NEXUS_PASS'
                    )
                ]) {
                    sh '''
                      ssh -i /var/jenkins_home/.ssh/id_ed25519 -o StrictHostKeyChecking=no mayo@192.168.56.129 "
                        echo '$NEXUS_PASS' | docker login ${REGISTRY} -u '$NEXUS_USER' --password-stdin &&
                        docker pull ${REGISTRY}/${IMAGE_NAME}:${TAG} &&
                        docker stop app || true &&
                        docker rm app || true &&
                        docker run -d --name app -p 3000:3000 ${REGISTRY}/${IMAGE_NAME}:${TAG}
                      "
                    '''
                }
            }
        }



        stage('Deploy to VM3') {
            steps {
                echo "==> Deploy to VM3"
                withCredentials([
                    usernamePassword(
                        credentialsId: 'nexus-admin',
                        usernameVariable: 'NEXUS_USER',
                        passwordVariable: 'NEXUS_PASS'
                    )
                ]) {
                    sh '''
                      ssh -i /var/jenkins_home/.ssh/id_ed25519 -o StrictHostKeyChecking=no mayo@192.168.56.130 "
                        echo '$NEXUS_PASS' | docker login ${REGISTRY} -u '$NEXUS_USER' --password-stdin &&
                        docker pull ${REGISTRY}/${IMAGE_NAME}:${TAG} &&
                        docker stop app || true &&
                        docker rm app || true &&
                        docker run -d --name app -p 3000:3000 ${REGISTRY}/${IMAGE_NAME}:${TAG}
                      "
                    '''
                }
            }
        }



        stage('Reload Nginx') {
            steps {
                echo "==> Reload Nginx"
                sh '''
                  sudo systemctl reload nginx
                '''
            }
        }
    }

    post {
        success {
            echo "Pipeline SUCCESS: CI/CD + HA deploy completed"
        }
        failure {
            echo "Pipeline FAILED: Check logs"
        }
    }
}
