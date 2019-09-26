package io.github.ahappypie.marschat

import akka.actor.{Actor, Props}
import io.github.ahappypie.marschat.grpc.delay.LightDelayRequest

object DelaySupervisor {
  def props: Props = Props(new DelaySupervisor)
}

class DelaySupervisor extends Actor {
  override def receive: Receive = {
    case req: LightDelayRequest => {
      if(req.dest.isMars) {
        context.actorOf(MarsDelayActor.props).forward(req)
      } else if(req.dest.isJupiter) {
        context.actorOf(JupiterDelayActor.props).forward(req)
      } else if(req.dest.isSaturn) {
        context.actorOf(SaturnDelayActor.props).forward(req)
      }
    }
  }
}
