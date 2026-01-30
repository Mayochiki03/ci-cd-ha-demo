pipeline {
    agent any

    options {
        skipDefaultCheckout(true)
    }

    environment {
        REGISTRY = "192.168.56.128:50000"
        IMAGE_NAME = "app"
        TAG = "${BUILD_NUMBER}"
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


        stage('SonarQube Scan') {
            steps {
                withSonarQubeEnv('sonarqube') {
                    withCredentials([string(credentialsId: 'sonar-token', variable: 'SONAR_TOKEN')]) {
                        script {
                            def scannerHome = tool 'sonar-scanner'
                            def nodeHome = tool 'node18'

                            withEnv(["PATH+NODE=${nodeHome}/bin"]) {
                                sh """
                                    node -v
                                    ${scannerHome}/bin/sonar-scanner \
                                    -Dsonar.projectKey=ci-cd-ha-demo \
                                    -Dsonar.sources=. \
                                    -Dsonar.login=$SONAR_TOKEN
                                """
                            }
                        }
                    }
                }
            }
        }

        stage('Quality Gate') {
            steps {
                timeout(time: 2, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: false
                }
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

        stage('Save Previous Version') {
            steps {
                echo "==> Save previous running image"
                sh '''
                ssh -i /var/jenkins_home/.ssh/id_ed25519 -o StrictHostKeyChecking=no mayo@192.168.56.129 \
                    "docker inspect --format='{{.Config.Image}}' app 2>/dev/null || true" > prev_vm2.txt

                ssh -i /var/jenkins_home/.ssh/id_ed25519 -o StrictHostKeyChecking=no mayo@192.168.56.130 \
                    "docker inspect --format='{{.Config.Image}}' app 2>/dev/null || true" > prev_vm3.txt
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
        stage('Verify Deployment') {
        steps {
            echo "==> Verify application health"
    
            sh '''
              curl -f http://192.168.56.129:3000 || exit 1
              curl -f http://192.168.56.130:3000 || exit 1
            '''
        }
    }
    }


    post {
        success {
            echo "Pipeline SUCCESS: CI/CD + HA deploy completed"
        }

        failure {
            echo "DEPLOY FAILED → ROLLBACK to previous version"

            sh '''
            PREV_VM2=$(cat prev_vm2.txt || true)
            PREV_VM3=$(cat prev_vm3.txt || true)

            if [ ! -z "$PREV_VM2" ]; then
                ssh -i /var/jenkins_home/.ssh/id_ed25519 -o StrictHostKeyChecking=no mayo@192.168.56.129 "
                docker stop app || true &&
                docker rm app || true &&
                docker run -d --name app -p 3000:3000 $PREV_VM2
                "
            fi

            if [ ! -z "$PREV_VM3" ]; then
                ssh -i /var/jenkins_home/.ssh/id_ed25519 -o StrictHostKeyChecking=no mayo@192.168.56.130 "
                docker stop app || true &&
                docker rm app || true &&
                docker run -d --name app -p 3000:3000 $PREV_VM3
                "
            fi
            '''
        }
    }

}
